import { db } from '@/lib/db/drizzle';
import { Team, teamMembers, teams } from '@/lib/db/schema';
import { sendSubscriptionActivatedEmail, sendTrialEmail } from '@/lib/email/send-emails';
import { formatDate } from '@/lib/utils';
import { and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { getTeamByStripeCustomerId, getUser } from '../db/queries';

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
});

// Helper function to get date only (no time) from timestamp
function getDateOnly(timestamp: number | null): Date | null {
  if (!timestamp) return null;

  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Create a new date with only year, month, day (no time)
  return new Date(year, month, day);
}

export async function createCheckoutSession({
  team,
  priceId,
}: {
  team: Team | null;
  priceId: string;
}) {
  const user = await getUser();

  if (!team || !user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  // Check if the team already has an active subscription
  if (
    team.stripeSubscriptionId &&
    ['active', 'trialing', 'incomplete'].includes(team.subscriptionStatus || '')
  ) {
    console.log('User already has an active subscription, redirecting to customer portal');

    // Create a customer portal session instead
    const portalSession = await createCustomerPortalSession(team);
    redirect(portalSession.url);
    return;
  }

  // Continue with checkout session creation for new subscribers
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: team.stripeCustomerId || undefined,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14,
    },
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(team: Team) {
  if (!team.stripeCustomerId || !team.stripeProductId) {
    redirect('/pricing');
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    const product = await stripe.products.retrieve(team.stripeProductId);
    if (!product.active) {
      throw new Error("Team's product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the team's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription',
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
          products: [
            {
              product: product.id,
              prices: prices.data.map((price) => price.id),
            },
          ],
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: ['too_expensive', 'missing_features', 'switched_service', 'unused', 'other'],
          },
        },
      },
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: team.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id,
  });
}

export async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  console.log('Processing subscription change:', {
    subscriptionId,
    status,
    trial_end: subscription.trial_end,
    current_period_end: subscription.current_period_end,
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.error('Team not found for Stripe customer:', customerId);
    return;
  }

  // Add detailed logging for debugging
  console.log('Found team for subscription change:', {
    teamId: team.id,
    teamName: team.name,
    currentStatus: team.subscriptionStatus,
    newStatus: status,
  });

  // Get team owner information
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
    'Team owner lookup result:',
    teamOwner
      ? {
          found: true,
          userId: teamOwner.userId,
          userEmail: teamOwner.user?.email,
          userName: teamOwner.user?.name,
        }
      : { found: false },
  );

  const ownerEmail = teamOwner?.user?.email;
  const ownerName = teamOwner?.user?.name || 'there';

  if (status === 'trialing') {
    // Handle new trial
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
    const trialStart = new Date();
    const trialDays = trialEnd
      ? Math.ceil((trialEnd.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    console.log('Processing trial subscription:', {
      trialDays,
      trialStart: trialStart.toISOString(),
      trialEnd: trialEnd?.toISOString(),
      hasOwnerEmail: !!ownerEmail,
    });

    // Get subscription details
    const subscriptionItem = subscription.items.data[0];
    const priceId = subscriptionItem?.price.id;

    // Get price details from Stripe
    const price = priceId ? await stripe.prices.retrieve(priceId) : null;
    const product = price?.product ? await stripe.products.retrieve(price.product as string) : null;

    const planName = product?.name || 'Premium';
    const amount = formatPrice(price);

    // Update team subscription info
    await db
      .update(teams)
      .set({
        stripeSubscriptionId: subscriptionId,
        stripeProductId: product?.id || null,
        planName: planName,
        subscriptionStatus: status,
        trialEndsAt: trialEnd,
        nextBillingDate: trialEnd,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, team.id));

    // Send trial email if we have an owner email
    if (ownerEmail && trialEnd) {
      try {
        console.log('Attempting to send trial email to:', ownerEmail);
        await sendTrialEmail(
          ownerEmail,
          ownerName,
          trialDays,
          formatDate(trialStart),
          formatDate(trialEnd),
          formatDate(trialEnd),
          amount,
          `${process.env.BASE_URL}/dashboard`,
          `${process.env.BASE_URL}/pricing`,
        );
        console.log(`Trial email successfully sent to ${ownerEmail}`);
      } catch (error) {
        console.error('Failed to send trial email:', error);
        // Log more detailed error information
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
          });
        }
      }
    } else {
      console.warn('Cannot send trial email - missing required data:', {
        hasOwnerEmail: !!ownerEmail,
        hasTrialEnd: !!trialEnd,
      });
    }
  }
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring',
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId: typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days,
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price'],
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === 'string' ? product.default_price : product.default_price?.id,
  }));
}

// Helper function to format price
export function formatPrice(price: Stripe.Price | null): string {
  if (!price || !price.unit_amount) {
    return '$0.00';
  }

  const amount = price.unit_amount / 100;
  const currency = price.currency.toUpperCase();
  const interval = price.recurring?.interval;

  return `$${amount.toFixed(2)}/${interval === 'month' ? 'month' : 'year'}`;
}

// Helper function to get billing period
function getBillingPeriod(price: Stripe.Price | null): string {
  if (!price || !price.recurring) {
    return 'Monthly';
  }

  return price.recurring.interval === 'month' ? 'Monthly' : 'Yearly';
}

export { formatDate, sendSubscriptionActivatedEmail, sendTrialEmail };
// Remove the local formatDate function completely since we're importing it
