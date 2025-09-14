import { verifyToken } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle-edge'; // Changed to edge-compatible client
import { teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export type SubscriptionCheckResult = {
  isValid: boolean;
  status?: string;
  error?: string;
};

export async function checkTeamSubscription(
  sessionCookieValue?: string,
): Promise<SubscriptionCheckResult> {
  try {
    if (!sessionCookieValue) {
      return { isValid: false, error: 'No session cookie' };
    }

    // Verify the JWT token from the cookie
    const parsed = await verifyToken(sessionCookieValue);
    if (!parsed?.user?.id) {
      return { isValid: false, error: 'Invalid session' };
    }

    // Find the team member entry with their team
    const teamMember = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, parsed.user.id),
      with: {
        team: true,
      },
    });

    if (!teamMember?.team) {
      return { isValid: false, error: 'No team found' };
    }

    const subscriptionStatus = teamMember.team.subscriptionStatus;

    if (!subscriptionStatus) {
      return { isValid: false, error: 'No subscription status' };
    }

    // Check if subscription is active or trialing
    if (subscriptionStatus !== 'active' && subscriptionStatus !== 'trialing') {
      return {
        isValid: false,
        status: subscriptionStatus,
        error: 'Invalid subscription status',
      };
    }

    return {
      isValid: true,
      status: subscriptionStatus,
    };
  } catch (error) {
    console.error('Subscription check error:', error);
    return { isValid: false, error: 'Server error' };
  }
}
