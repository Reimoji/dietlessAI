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

export const dynamic = 'force-dynamic';

// 🆕 Helper function to find team by customer email
async function getTeamByCustomerEmail(email: string) {
  const teamName = `${email}'s Team`;
  
  const team = await db.query.teams.findFirst({
    where: eq(teams.name, teamName),
  });
  
  return team || null;
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  console.log('[stripe] webhook POST');

  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string | null;

  if (!signature) {
    console.error('[stripe] missing signature header');
    return NextResponse.json({ error: 'missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('[stripe] signature verification failed', err);
    return NextResponse.json({ error: 'signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;

        // Safe access helpers
        const customerId = (sub.customer || '') as string;
        const status = sub.status;
        const cancelAtPeriodEnd = !!sub.cancel_at_period_end;
        const endedAt = sub.ended_at ? new Date(sub.ended_at * 1000) : null;
        const currentPeriodEndUnix = (sub as any)?.current_period_end as number | undefined;
        const currentPeriodEnd = currentPeriodEndUnix
          ? new Date(currentPeriodEndUnix * 1000)
          : null;

        // 👇 read language from metadata (default en)
        const lang = (sub.metadata?.lang as string) || 'en';

        console.log('[stripe] subscription event', {
          type: event.type,
          id: sub.id,
          status,
          customerId,
          cancelAtPeriodEnd,
          hasEndedAt: !!endedAt,
          hasCpe: !!currentPeriodEndUnix,
          lang,
        });

        // Keep your extra sync logic, but don't let it crash the webhook
        try {
          await handleSubscriptionChange(sub);
        } catch (e) {
          console.warn('[stripe] handleSubscriptionChange failed (non-fatal)', e);
        }

        // 🆕 IMPROVED: Find owning team with email fallback
        let team = await getTeamByStripeCustomerId(customerId);
        
        if (!team) {
          console.log('[stripe] no team found by stripe_customer_id, trying email fallback');
          
          // Try to get customer email from subscription or fetch customer
          let customerEmail: string | null = null;
          
          // Method 1: Check if customer object is expanded
          if (typeof sub.customer === 'object' && sub.customer !== null) {
            customerEmail = (sub.customer as any).email || null;
          }
          
          // Method 2: Fetch customer from Stripe if needed
          if (!customerEmail && typeof sub.customer === 'string') {
            try {
              const customer = await stripe.customers.retrieve(sub.customer);
              if (customer && !customer.deleted) {
                customerEmail = customer.email || null;
              }
            } catch (e) {
              console.warn('[stripe] failed to fetch customer', e);
            }
          }
          
          if (customerEmail) {
            console.log('[stripe] attempting to find team by email:', customerEmail);
            team = await getTeamByCustomerEmail(customerEmail);
            
            // 🆕 If found, backfill the stripe_customer_id
            if (team) {
              console.log('[stripe] found team by email, backfilling stripe_customer_id');
              try {
                await db
                  .update(teams)
                  .set({
                    stripeCustomerId: customerId,
                    updatedAt: new Date(),
                  })
                  .where(eq(teams.id, team.id));
                
                console.log('[stripe] successfully backfilled stripe_customer_id for team', team.id);
              } catch (e) {
                console.error('[stripe] failed to backfill stripe_customer_id', e);
              }
            }
          }
        }
        
        if (!team) {
          console.warn('[stripe] no team found for customer (tried both methods)', { customerId });
          break; // still 200 OK
        }

        // Get owner email (optional)
        const teamOwner = await db.query.teamMembers.findFirst({
          where: and(eq(teamMembers.teamId, team.id), eq(teamMembers.role, 'owner')),
          with: {
            user: { columns: { id: true, email: true, name: true } },
          },
        });
        const userEmail = teamOwner?.user?.email ?? null;
        const userName = (teamOwner?.user?.name || 'there') as string;

        // 🆕 Get full subscription details for complete database update
        const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;
        const nextBilling = currentPeriodEnd;
        const subEndDate =
          endedAt ?? (cancelAtPeriodEnd && currentPeriodEnd ? currentPeriodEnd : null);

        // 🆕 Get product and plan information
        let productId: string | null = null;
        let planName: string | null = null;
        
        try {
          const firstItem = sub.items.data[0];
          if (firstItem?.price) {
            const price = firstItem.price;
            productId = typeof price.product === 'string' 
              ? price.product 
              : price.product?.id || null;
            
            // Get product name
            if (productId) {
              const product = await stripe.products.retrieve(productId);
              planName = product.name;
            }
          }
        } catch (e) {
          console.warn('[stripe] failed to fetch product details', e);
        }

        // 🆕 Update ALL subscription fields in database
        try {
          await db
            .update(teams)
            .set({
              stripeSubscriptionId: sub.id,
              stripeProductId: productId,
              planName: planName,
              subscriptionStatus: status,
              trialEndsAt: trialEnd,
              nextBillingDate: nextBilling,
              subscriptionEndDate: subEndDate,
              updatedAt: new Date(),
            })
            .where(eq(teams.id, team.id));
          
          console.log('[stripe] successfully updated team with complete subscription data');
        } catch (e) {
          console.error('[stripe] DB update failed', e);
        }

        // Side-effects per event (don't let failures 500 the webhook)
        if (event.type === 'customer.subscription.created') {
          if (userEmail) {
            try {
              await handleSubscriptionCreated(userEmail, sub, null);
            } catch (e) {
              console.warn('[stripe] handleSubscriptionCreated failed (non-fatal)', e);
            }
          }
          
          // 🆕 Send trial email if status is trialing
          if (status === 'trialing' && trialEnd && userEmail) {
            try {
              // Check if trial email was already sent
              const currentTeam = await db.select().from(teams).where(eq(teams.id, team.id)).limit(1);
              
              if (!currentTeam[0]?.trialEmailSent) {
                const trialStart = new Date();
                const trialDays = Math.ceil(
                  (trialEnd.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24),
                );
                
                // Import the email function
                const { sendTrialEmail } = await import('@/lib/email/send-emails');
                const { formatDate, formatPrice } = await import('@/lib/payments/stripe');
                
                // Get price for formatting
                const firstItem = sub.items.data[0];
                const price = firstItem?.price || null;
                
                await sendTrialEmail(
                  userEmail,
                  userName,
                  trialDays,
                  formatDate(trialStart),
                  formatDate(trialEnd),
                  formatDate(trialEnd),
                  formatPrice(price),
                  `${process.env.BASE_URL}/${lang}/dashboard`,
                  `${process.env.BASE_URL}/${lang}/pricing`,
                  lang
                );
                
                // Mark as sent
                await db
                  .update(teams)
                  .set({ trialEmailSent: true })
                  .where(eq(teams.id, team.id));
                
                console.log('[stripe] trial email sent successfully');
              } else {
                console.log('[stripe] trial email already sent, skipping');
              }
            } catch (e) {
              console.warn('[stripe] failed to send trial email (non-fatal)', e);
            }
          }
        } else if (event.type === 'customer.subscription.updated') {
          if (userEmail) {
            try {
              await handleSubscriptionUpdated(userEmail, sub, null);
            } catch (e) {
              console.warn('[stripe] handleSubscriptionUpdated failed (non-fatal)', e);
            }
          }

          // If user canceled at period end, send courtesy email with end date
          if (userEmail && cancelAtPeriodEnd && currentPeriodEnd) {
            try {
              await sendSubscriptionCancelledEmail(
                userEmail,
                userName,
                team.planName || 'Premium',
                formatDate(currentPeriodEnd),
                `${process.env.BASE_URL}/${lang}/dashboard/billing`,
                `${process.env.BASE_URL}/${lang}/feedback`,
                lang
              );
            } catch (e) {
              console.warn(
                '[stripe] sendSubscriptionCancelledEmail (updated) failed (non-fatal)',
                e,
              );
            }
          }
        } else if (event.type === 'customer.subscription.deleted') {
          if (userEmail) {
            try {
              await handleSubscriptionCancelled(userEmail, sub, null, 'Subscription deleted');
            } catch (e) {
              console.warn('[stripe] handleSubscriptionCancelled failed (non-fatal)', e);
            }
            // Immediate cancel email
            try {
              await sendSubscriptionCancelledEmail(
                userEmail,
                userName,
                team.planName || 'Premium',
                formatDate(endedAt ?? new Date()),
                `${process.env.BASE_URL}/${lang}/dashboard/billing`,
                `${process.env.BASE_URL}/${lang}/feedback`,
                lang
              );
            } catch (e) {
              console.warn(
                '[stripe] sendSubscriptionCancelledEmail (deleted) failed (non-fatal)',
                e,
              );
            }
          }
        }

        break;
      }
      default:
        console.log('[stripe] unhandled event', event.type);
    }

    console.log('[stripe] webhook OK', { ms: Date.now() - startedAt });
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[stripe] webhook top-level error', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}