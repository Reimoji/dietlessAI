'use server';

import { withTeam } from '@/lib/auth/middleware';
import { TeamDataWithMembers } from '@/lib/db/schema';
import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';

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
    nextBillingDate: team.nextBillingDate ? new Date(team.nextBillingDate) : null,
    subscriptionEndDate: team.subscriptionEndDate ? new Date(team.subscriptionEndDate) : null,
  };
}

export const checkoutAction = withTeam(async (formData, team) => {
  const priceId = formData.get('priceId') as string;
  const convertedTeam = convertTeamData(team);
  await createCheckoutSession({ team: convertedTeam, priceId });
});

export const customerPortalAction = withTeam(async (_, team) => {
  const convertedTeam = convertTeamData(team);
  const portalSession = await createCustomerPortalSession(convertedTeam);
  redirect(portalSession.url);
});
