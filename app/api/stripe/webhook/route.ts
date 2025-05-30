import { db } from '@/lib/db/drizzle';
import { getTeamByStripeCustomerId } from '@/lib/db/queries';
import { teamMembers, teams } from '@/lib/db/schema';
import { sendSubscriptionCancelledEmail } from '@/lib/email/send-emails';
import { 
  handleSubscriptionCancelled, 
  handleSubscriptionCreated, 
  handleSubscriptionUpdated 
} from '@/lib/klaviyo/stripe-integration';
import { formatDate, handleSubscriptionChange, stripe } from '@/lib/payments/stripe';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  console.log('Webhook endpoint called');

  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  console.log('Webhook received with signature:', signature ? 'present' : 'missing');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    console.log('Received webhook event:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription created event received:', {
          id: subscription.id,
          status: subscription.status,
          trial_end: subscription.trial_end,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
        });
        
        // Handle subscription in database
        await handleSubscriptionChange(subscription);
        
        // Track in Klaviyo if possible
        try {
          const customerId = subscription.customer as string;
          const team = await getTeamByStripeCustomerId(customerId);
          
          if (team) {
            // Get team owner
            const teamOwner = await db.query.teamMembers.findFirst({
              where: and(eq(teamMembers.teamId, team.id), eq(teamMembers.role, 'owner')),
              with: {
                user: {
                  columns: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            });
            
            if (teamOwner?.user?.email) {
              // Get product details
              const subscriptionItem = subscription.items.data[0];
              const priceId = subscriptionItem?.price.id;
              const price = priceId ? await stripe.prices.retrieve(priceId) : null;
              const product = price?.product ? await stripe.products.retrieve(price.product as string) : null;
              
              console.log('Tracking subscription created in Klaviyo for:', teamOwner.user.email);
              await handleSubscriptionCreated(teamOwner.user.email, subscription, product);
            }
          }
        } catch (error) {
          console.error('Failed to track subscription created in Klaviyo:', error);
        }
        break;

      case 'customer.subscription.updated':
        const subUpdate = event.data.object as Stripe.Subscription;
        console.log('Subscription updated event received:', {
          id: subUpdate.id,
          status: subUpdate.status,
          cancel_at_period_end: subUpdate.cancel_at_period_end,
          current_period_end: subUpdate.current_period_end,
        });

        // If subscription is marked to cancel at period end, handle it directly
        if (subUpdate.cancel_at_period_end) {
          const customerId = subUpdate.customer as string;
          console.log('Subscription marked for cancellation, customer ID:', customerId);

          const team = await getTeamByStripeCustomerId(customerId);
          console.log(
            'Team found for cancellation:',
            team ? { id: team.id, name: team.name } : 'No team found',
          );

          if (team) {
            const endDate = subUpdate.current_period_end
              ? new Date(subUpdate.current_period_end * 1000)
              : null;

            // Update team subscription info
            await db
              .update(teams)
              .set({
                subscriptionEndDate: endDate,
                updatedAt: new Date(),
              })
              .where(eq(teams.id, team.id));

            // Get team owner
            const teamOwner = await db.query.teamMembers.findFirst({
              where: and(eq(teamMembers.teamId, team.id), eq(teamMembers.role, 'owner')),
              with: {
                user: {
                  columns: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            });

            console.log(
              'Team owner for cancellation:',
              teamOwner
                ? {
                    email: teamOwner.user?.email,
                    name: teamOwner.user?.name,
                  }
                : 'No owner found',
            );

            // Send cancellation email
            if (teamOwner?.user?.email && endDate) {
              try {
                console.log('Sending cancellation email directly from webhook');
                await sendSubscriptionCancelledEmail(
                  teamOwner.user.email,
                  teamOwner.user.name || 'there',
                  team.planName || 'Premium',
                  formatDate(endDate),
                  `${process.env.BASE_URL}/dashboard/billing`,
                  `${process.env.BASE_URL}/feedback`,
                );
                console.log('Cancellation email sent successfully from webhook');
              } catch (error) {
                console.error('Failed to send cancellation email from webhook:', error);
              }
              
              // Track cancellation in Klaviyo
              try {
                // Get product details
                const subscriptionItem = subUpdate.items.data[0];
                const priceId = subscriptionItem?.price.id;
                const price = priceId ? await stripe.prices.retrieve(priceId) : null;
                const product = price?.product ? await stripe.products.retrieve(price.product as string) : null;
                
                console.log('Tracking subscription cancellation in Klaviyo for:', teamOwner.user.email);
                await handleSubscriptionCancelled(teamOwner.user.email, subUpdate, product);
              } catch (error) {
                console.error('Failed to track subscription cancellation in Klaviyo:', error);
              }
            }
          }
        }

        // Still call the regular handler
        await handleSubscriptionChange(subUpdate);
        
        // Track subscription update in Klaviyo
        try {
          const customerId = subUpdate.customer as string;
          const team = await getTeamByStripeCustomerId(customerId);
          
          if (team) {
            // Get team owner
            const teamOwner = await db.query.teamMembers.findFirst({
              where: and(eq(teamMembers.teamId, team.id), eq(teamMembers.role, 'owner')),
              with: {
                user: {
                  columns: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            });
            
            if (teamOwner?.user?.email) {
              // Get product details
              const subscriptionItem = subUpdate.items.data[0];
              const priceId = subscriptionItem?.price.id;
              const price = priceId ? await stripe.prices.retrieve(priceId) : null;
              const product = price?.product ? await stripe.products.retrieve(price.product as string) : null;
              
              console.log('Tracking subscription updated in Klaviyo for:', teamOwner.user.email);
              await handleSubscriptionUpdated(teamOwner.user.email, subUpdate, product);
            }
          }
        } catch (error) {
          console.error('Failed to track subscription update in Klaviyo:', error);
        }
        break;

      case 'customer.subscription.deleted':
        const subDelete = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted event received:', {
          id: subDelete.id,
          status: subDelete.status,
        });
        await handleSubscriptionChange(subDelete);
        
        // Track subscription deletion in Klaviyo
        try {
          const customerId = subDelete.customer as string;
          const team = await getTeamByStripeCustomerId(customerId);
          
          if (team) {
            // Get team owner
            const teamOwner = await db.query.teamMembers.findFirst({
              where: and(eq(teamMembers.teamId, team.id), eq(teamMembers.role, 'owner')),
              with: {
                user: {
                  columns: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            });
            
            if (teamOwner?.user?.email) {
              // Get product details
              const subscriptionItem = subDelete.items.data[0];
              const priceId = subscriptionItem?.price.id;
              const price = priceId ? await stripe.prices.retrieve(priceId) : null;
              const product = price?.product ? await stripe.products.retrieve(price.product as string) : null;
              
              console.log('Tracking subscription deleted in Klaviyo for:', teamOwner.user.email);
              await handleSubscriptionCancelled(teamOwner.user.email, subDelete, product, 'Subscription deleted');
            }
          }
        } catch (error) {
          console.error('Failed to track subscription deletion in Klaviyo:', error);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
  }
}

