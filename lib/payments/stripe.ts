import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { Team, teams } from '@/lib/db/schema';
import {
  getTeamByStripeCustomerId,
  getUser,
  updateTeamSubscription
} from '@/lib/db/queries';
import { db } from '../db/drizzle';
import { eq } from 'drizzle-orm';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia'
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
  priceId
}: {
  team: Team | null;
  priceId: string;
}) {
  const user = await getUser();

  if (!team || !user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  // Check if the team already has an active subscription
  if (team.stripeSubscriptionId && 
      ['active', 'trialing', 'incomplete'].includes(team.subscriptionStatus || '')) {
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
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: team.stripeCustomerId || undefined,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14
    }
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
      active: true
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the team's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription'
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
          products: [
            {
              product: product.id,
              prices: prices.data.map((price) => price.id)
            }
          ]
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other'
            ]
          }
        }
      }
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: team.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  console.log('Processing subscription change:', {
    subscriptionId,
    status,
    trial_end: subscription.trial_end,
    current_period_end: subscription.current_period_end,
    cancel_at_period_end: subscription.cancel_at_period_end
  });

  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.error('Team not found for Stripe customer:', customerId);
    return;
  }

  if (status === 'active' || status === 'trialing') {
    const plan = subscription.items.data[0]?.plan;
    
    // Get product details
    let productId = plan?.product as string;
    let productName = null;
    
    if (productId) {
      try {
        const product = await stripe.products.retrieve(productId);
        productName = product.name;
      } catch (error) {
        console.error('Error retrieving product:', error);
      }
    }
    
    // Calculate dates - only store the date part, not the time
    const trialEndsAt = getDateOnly(subscription.trial_end);
    const nextBillingDate = getDateOnly(subscription.current_period_end);
    const subscriptionEndDate = subscription.cancel_at_period_end ? 
      getDateOnly(subscription.current_period_end) : null;
    
    console.log('Updating subscription with dates (date only):', {
      trialEndsAt,
      nextBillingDate,
      subscriptionEndDate
    });
    
    // Update the team subscription in the database
    await db
      .update(teams)
      .set({
        stripeSubscriptionId: subscriptionId,
        stripeProductId: productId,
        planName: productName,
        subscriptionStatus: status,
        trialEndsAt: trialEndsAt,
        nextBillingDate: nextBillingDate,
        subscriptionEndDate: subscriptionEndDate,
        updatedAt: new Date()
      })
      .where(eq(teams.id, team.id));
      
    console.log('Subscription updated successfully for team:', team.id);
  } else if (status === 'canceled' || status === 'unpaid') {
    // Handle cancellation
    await db
      .update(teams)
      .set({
        stripeSubscriptionId: null,
        stripeProductId: null,
        planName: null,
        subscriptionStatus: status,
        trialEndsAt: null,
        nextBillingDate: null,
        subscriptionEndDate: null,
        updatedAt: new Date()
      })
      .where(eq(teams.id, team.id));
      
    console.log('Subscription canceled for team:', team.id);
  }
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring'
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price']
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id
  }));
}
