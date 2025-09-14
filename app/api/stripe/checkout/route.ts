import { setSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { teamMembers, teams, users } from '@/lib/db/schema';
import { handleSubscriptionCreated } from '@/lib/klaviyo/stripe-integration';
import {
  formatDate,
  formatPrice,
  sendSubscriptionActivatedEmail,
  sendTrialEmail,
  stripe,
} from '@/lib/payments/stripe';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(`${process.env.BASE_URL}/pricing`);
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription'],
    });

    if (!session.customer || typeof session.customer === 'string') {
      throw new Error('Invalid customer data from Stripe.');
    }

    const customerId = session.customer.id;
    const subscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

    if (!subscriptionId) {
      throw new Error('No subscription found for this session.');
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product'],
    });

    const plan = subscription.items.data[0]?.price;

    if (!plan) {
      throw new Error('No plan found for this subscription.');
    }

    const productId = (plan.product as Stripe.Product).id;

    if (!productId) {
      throw new Error('No product ID found for this subscription.');
    }

    const userId = session.client_reference_id;
    if (!userId) {
      throw new Error("No user ID found in session's client_reference_id.");
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)))
      .limit(1);

    if (user.length === 0) {
      throw new Error('User not found in database.');
    }

    const userTeam = await db
      .select({
        teamId: teamMembers.teamId,
      })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user[0].id))
      .limit(1);

    if (userTeam.length === 0) {
      throw new Error('User is not associated with any team.');
    }

    const trialEndsAt = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;

    const currentPeriodEnd = (subscription as any).current_period_end;
    const nextBillingDate = currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null;

    const subscriptionEndDate =
      subscription.cancel_at_period_end && currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null;

    await db
      .update(teams)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripeProductId: productId,
        planName: (plan.product as Stripe.Product).name,
        subscriptionStatus: subscription.status,
        trialEndsAt,
        nextBillingDate,
        subscriptionEndDate,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, userTeam[0].teamId));

    const teamOwner = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.teamId, userTeam[0].teamId), eq(teamMembers.role, 'owner')),
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

    if (subscription.status === 'trialing' && trialEndsAt) {
      if (teamOwner?.user?.email) {
        const trialStart = new Date();
        const trialDays = Math.ceil(
          (trialEndsAt.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24),
        );

        try {
          await sendTrialEmail(
            teamOwner.user.email,
            teamOwner.user.name || 'there',
            trialDays,
            formatDate(trialStart),
            formatDate(trialEndsAt),
            formatDate(trialEndsAt),
            formatPrice(plan),
            `${process.env.BASE_URL}/dashboard`,
            `${process.env.BASE_URL}/pricing`,
          );
        } catch (error) {
          console.error('Failed to send trial email from checkout handler:', error);
        }

        try {
          const subscriptionItem = subscription.items.data[0];
          const priceId = subscriptionItem?.price.id;
          const price = priceId ? await stripe.prices.retrieve(priceId) : null;
          const product = price?.product
            ? await stripe.products.retrieve(price.product as string)
            : null;
          await handleSubscriptionCreated(teamOwner.user.email, subscription, product);
        } catch (error) {
          console.error('Failed to track trial subscription in Klaviyo:', error);
        }
      }
    } else if (subscription.status === 'active') {
      if (teamOwner?.user?.email && nextBillingDate) {
        const billingPeriod = plan.recurring?.interval === 'year' ? 'Yearly' : 'Monthly';

        try {
          await sendSubscriptionActivatedEmail(
            teamOwner.user.email,
            teamOwner.user.name || 'there',
            (plan.product as Stripe.Product).name,
            billingPeriod,
            formatPrice(plan),
            formatDate(nextBillingDate),
            `${process.env.BASE_URL}/dashboard`,
          );
        } catch (error) {
          console.error(
            'Failed to send subscription activated email from checkout handler:',
            error,
          );
        }

        try {
          const subscriptionItem = subscription.items.data[0];
          const priceId = subscriptionItem?.price.id;
          const price = priceId ? await stripe.prices.retrieve(priceId) : null;
          const product = price?.product
            ? await stripe.products.retrieve(price.product as string)
            : null;
          await handleSubscriptionCreated(teamOwner.user.email, subscription, product);
        } catch (error) {
          console.error('Failed to track active subscription in Klaviyo:', error);
        }
      }
    }

    await setSession(user[0]);

    // Calculate the purchase value for Facebook Pixel tracking
    const purchaseValue = plan.unit_amount ? plan.unit_amount / 100 : 0; // Convert from cents to euros
    const isYearly = plan.recurring?.interval === 'year';

    // Redirect to dashboard with purchase tracking parameters
    const dashboardUrl = new URL(`${process.env.BASE_URL}/dashboard`);
    dashboardUrl.searchParams.set('from_checkout', 'true');
    dashboardUrl.searchParams.set('purchase_value', purchaseValue.toString());
    dashboardUrl.searchParams.set('subscription_status', subscription.status);
    dashboardUrl.searchParams.set('plan_interval', plan.recurring?.interval || 'month');

    return NextResponse.redirect(dashboardUrl.toString());
  } catch (error) {
    console.error('Error handling successful checkout:', error);
    return NextResponse.redirect(`${process.env.BASE_URL}/error`);
  }
}
