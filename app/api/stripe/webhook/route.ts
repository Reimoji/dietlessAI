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

        // Find owning team
        const team = await getTeamByStripeCustomerId(customerId);
        if (!team) {
          console.warn('[stripe] no team for customer', { customerId });
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

        // Persist status & end date for ALL sub events
        const subEndDate =
          endedAt ?? (cancelAtPeriodEnd && currentPeriodEnd ? currentPeriodEnd : null);

        try {
          await db
            .update(teams)
            .set({
              subscriptionStatus: status,
              subscriptionEndDate: subEndDate,
              updatedAt: new Date(),
            })
            .where(eq(teams.id, team.id));
        } catch (e) {
          console.error('[stripe] DB update failed', e);
        }

        // Side-effects per event (don’t let failures 500 the webhook)
        if (event.type === 'customer.subscription.created') {
          if (userEmail) {
            try {
              await handleSubscriptionCreated(userEmail, sub, null);
            } catch (e) {
              console.warn('[stripe] handleSubscriptionCreated failed (non-fatal)', e);
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
