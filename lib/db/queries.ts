import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, TeamDataWithMembers, teamMembers, TeamMemberWithUser, teams, users } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

// Helper function to format date without time
function formatDateString(date: Date | null): string | null {
  if (!date) return null;
  
  try {
    // Convert to ISO string and extract just the date part (YYYY-MM-DD)
    return date.toISOString().split('T')[0];
  } catch (e) {
    console.error('Error formatting date:', e);
    return null;
  }
}

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
    trialEndsAt?: Date | null;
    nextBillingDate?: Date | null;
    subscriptionEndDate?: Date | null;
  }
) {
  await db
    .update(teams)
    .set({
      stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
      stripeProductId: subscriptionData.stripeProductId,
      planName: subscriptionData.planName,
      subscriptionStatus: subscriptionData.subscriptionStatus as any,
      trialEndsAt: subscriptionData.trialEndsAt || null,
      nextBillingDate: subscriptionData.nextBillingDate || null,
      subscriptionEndDate: subscriptionData.subscriptionEndDate || null,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser(userId: number): Promise<TeamDataWithMembers | null> {
  try {
    console.log('Fetching team for user:', userId);
    
    const teamMember = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, userId),
      with: {
        team: true,
        user: true
      }
    });
    
    if (!teamMember?.team) {
      console.log('No team found for user:', userId);
      return null;
    }
    
    console.log('Raw team data:', {
      trialEndsAt: teamMember.team.trialEndsAt,
      nextBillingDate: teamMember.team.nextBillingDate,
      subscriptionEndDate: teamMember.team.subscriptionEndDate
    });
    
    // Format the dates
    const formattedTrialEndsAt = formatDateString(teamMember.team.trialEndsAt);
    const formattedNextBillingDate = formatDateString(teamMember.team.nextBillingDate);
    const formattedSubscriptionEndDate = formatDateString(teamMember.team.subscriptionEndDate);
    
    console.log('Formatted dates:', {
      trialEndsAt: formattedTrialEndsAt,
      nextBillingDate: formattedNextBillingDate,
      subscriptionEndDate: formattedSubscriptionEndDate
    });
    
    // Get all team members for this team
    const allTeamMembers = await db.query.teamMembers.findMany({
      where: eq(teamMembers.teamId, teamMember.team.id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Explicitly cast to TeamMemberWithUser[]
    const mappedTeamMembers: TeamMemberWithUser[] = allTeamMembers.map(member => ({
      id: member.id,
      userId: member.userId,
      teamId: member.teamId,
      role: member.role,
      joinedAt: member.joinedAt,
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email
      }
    }));

    const result = {
      id: String(teamMember.team.id),
      name: teamMember.team.name,
      stripeCustomerId: teamMember.team.stripeCustomerId,
      stripeSubscriptionId: teamMember.team.stripeSubscriptionId,
      stripeProductId: teamMember.team.stripeProductId,
      planName: teamMember.team.planName,
      subscriptionStatus: teamMember.team.subscriptionStatus,
      trialEndsAt: formattedTrialEndsAt,
      nextBillingDate: formattedNextBillingDate,
      subscriptionEndDate: formattedSubscriptionEndDate,
      teamMembers: mappedTeamMembers
    };
    
    console.log('Final result object:', result);
    
    return result;
  } catch (error) {
    console.error('Error in getTeamForUser:', error);
    throw error;
  }
}
// The formatDateString function is now at the top of the file

