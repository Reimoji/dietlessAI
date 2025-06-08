import { db } from '@/lib/db/drizzle';
import { getTeamByStripeCustomerId } from '@/lib/db/queries';
import { teamMembers, teams } from '@/lib/db/schema';
import { sendSubscriptionCancelledEmail } from '@/lib/email/send-emails';
import {
  handleSubscriptionCancelled,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
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
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        console.log(`Subscription event received: ${event.type}`, {
          id: subscription.id,
          status: subscription.status,
          trial_end: subscription.trial_end,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
        });

        await handleSubscriptionChange(subscription);

        const customerId = subscription.customer as string;
        const team = await getTeamByStripeCustomerId(customerId);
        if (!team) break;

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

        if (!teamOwner?.user?.email) break;

        const subscriptionItem = subscription.items.data[0];
        const priceId = subscriptionItem?.price.id;
        const price = priceId ? await stripe.prices.retrieve(priceId) : null;
        const product = price?.product ? await stripe.products.retrieve(price.product as string) : null;

        const userEmail = teamOwner.user.email;

        if (event.type === 'customer.subscription.created') {
          await handleSubscriptionCreated(userEmail, subscription, product);
        } else if (event.type === 'customer.subscription.updated') {
          await handleSubscriptionUpdated(userEmail, subscription, product);

          if (subscription.cancel_at_period_end && subscription.current_period_end) {
            const endDate = new Date(subscription.current_period_end * 1000);

            await db.update(teams).set({
              subscriptionEndDate: endDate,
              updatedAt: new Date(),
            }).where(eq(teams.id, team.id));

            await sendSubscriptionCancelledEmail(
              userEmail,
              teamOwner.user.name || 'there',
              team.planName || 'Premium',
              formatDate(endDate),
              `${process.env.BASE_URL}/dashboard/billing`,
              `${process.env.BASE_URL}/feedback`
            );
          }
        } else if (event.type === 'customer.subscription.deleted') {
          await handleSubscriptionCancelled(userEmail, subscription, product, 'Subscription deleted');
        }

        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
  }
}
