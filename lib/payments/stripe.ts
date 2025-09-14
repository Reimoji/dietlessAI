import { db } from '@/lib/db/drizzle';
import { Team, teamMembers, teams } from '@/lib/db/schema';
import { sendSubscriptionActivatedEmail, sendTrialEmail } from '@/lib/email/send-emails';
import { formatDate } from '@/lib/utils';
import { and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { getTeamByStripeCustomerId, getUser } from '../db/queries';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil' as any,
});

function getDateOnly(timestamp: number | null): Date | null {
  if (!timestamp) return null;
  const date = new Date(timestamp * 1000);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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

  if (
    team.stripeSubscriptionId &&
    ['active', 'trialing', 'incomplete'].includes(team.subscriptionStatus || '')
  ) {
    const portalSession = await createCustomerPortalSession(team);
    redirect(portalSession.url);
    return;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: team.stripeCustomerId || undefined,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
    subscription_data: { trial_period_days: 2 },
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(team: Team) {
  if (!team.stripeCustomerId) {
    redirect('/pricing');
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: team.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
  });

  return portalSession;
}

export async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : (subscription.customer as any)?.id;

  const subscriptionId = subscription.id;
  const status = subscription.status;

  const currentPeriodEnd = (subscription as any).current_period_end;
  const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;

  const team = await getTeamByStripeCustomerId(customerId);
  if (!team) return;

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

  const nextBillingDate = currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null;
  const subscriptionEndDate =
    subscription.cancel_at_period_end && currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000)
      : null;

  await db
    .update(teams)
    .set({
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: status,
      nextBillingDate,
      subscriptionEndDate,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, team.id));

  const ownerEmail = teamOwner?.user?.email;
  const ownerName = teamOwner?.user?.name || 'there';

  if (status === 'trialing' && trialEnd) {
    const trialStart = new Date();
    const trialDays = Math.ceil(
      (trialEnd.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24),
    );

    const subscriptionItem = subscription.items.data[0];
    const priceId = subscriptionItem?.price.id;
    const price = priceId ? await stripe.prices.retrieve(priceId) : null;
    const product = price?.product ? await stripe.products.retrieve(price.product as string) : null;

    const planName = product?.name || 'Premium';
    const amount = formatPrice(price);

    await db
      .update(teams)
      .set({
        stripeProductId: product?.id || null,
        planName,
        trialEndsAt: trialEnd,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, team.id));

    if (ownerEmail) {
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

export function formatPrice(price: Stripe.Price | null): string {
  if (!price || !price.unit_amount) return '€0.00';
  const amount = price.unit_amount / 100;
  const symbol = price.currency.toUpperCase() === 'EUR' ? '€' : '$';
  const interval = price.recurring?.interval === 'year' ? 'year' : 'month';
  return `${symbol}${amount.toFixed(2)}/${interval}`;
}

export { formatDate, sendSubscriptionActivatedEmail, sendTrialEmail };
