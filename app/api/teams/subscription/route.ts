import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      console.log('Subscription API: No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Subscription API: Checking subscription for user:', session.user.id);

    // First find the team member entry
    const teamMember = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, session.user.id),
      with: {
        team: true
      }
    });

    if (!teamMember?.team) {
      console.log('Subscription API: No team found for user');
      return NextResponse.json({ error: 'No team found' }, { status: 403 });
    }

    const team = teamMember.team;

    console.log('Subscription API: Found team:', {
      teamId: team.id,
      subscriptionStatus: team.subscriptionStatus,
      planName: team.planName,
      stripeSubscriptionId: team.stripeSubscriptionId
    });

    if (!team.subscriptionStatus) {
      console.log('Subscription API: No subscription status found');
      return NextResponse.json({ error: 'No subscription status' }, { status: 403 });
    }

    if (team.subscriptionStatus !== 'active' && team.subscriptionStatus !== 'trialing') {
      console.log('Subscription API: Invalid subscription status:', team.subscriptionStatus);
      return NextResponse.json({ error: 'Invalid subscription status' }, { status: 403 });
    }

    console.log('Subscription API: Returning valid status:', team.subscriptionStatus);
    return NextResponse.json({ status: team.subscriptionStatus });

  } catch (error) {
    console.error('Subscription API: Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}



