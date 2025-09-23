'use server';

import { withTeam } from '@/lib/auth/middleware';
import { TeamDataWithMembers } from '@/lib/db/schema';
import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from '@/lib/payments/stripe';

// Helper function to convert TeamDataWithMembers to Team format
function convertTeamData(team: TeamDataWithMembers) {
  return {
    id: parseInt(team.id),
    name: team.name,
    createdAt: new Date(),
    updatedAt: new Date(),
    stripeCustomerId: team.stripeCustomerId ?? null,
    stripeSubscriptionId: team.stripeSubscriptionId ?? null,
    stripeProductId: team.stripeProductId ?? null,
    planName: team.planName ?? null,
    subscriptionStatus: team.subscriptionStatus ?? null,
    trialEndsAt: team.trialEndsAt ? new Date(team.trialEndsAt) : null,
    trialEmailSent: false,
    nextBillingDate: team.nextBillingDate ? new Date(team.nextBillingDate) : null,
    subscriptionEndDate: team.subscriptionEndDate ? new Date(team.subscriptionEndDate) : null,
  };
}

// 🔑 Checkout action
export const checkoutAction = withTeam(async (formData, team) => {
  const priceId = formData.get('priceId') as string;
  const lang = formData.get('lang') as string;
  const convertedTeam = convertTeamData(team);

  await createCheckoutSession({ team: convertedTeam, priceId, lang });
});

// 🔑 Customer portal action
export const customerPortalAction = withTeam(async (formData, team) => {
  const lang = formData.get('lang') as string;
  const convertedTeam = convertTeamData(team);

  const portalSession = await createCustomerPortalSession(convertedTeam, lang);
  redirect(portalSession.url);
});