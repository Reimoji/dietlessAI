import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const team = await db.query.teams.findFirst({
      where: (teams) =>
        eq(teamMembers.userId, session.user.id),
      with: {
        teamMembers: true
      }
    });

    if (!team?.subscriptionStatus || team.subscriptionStatus === 'inactive') {
      return NextResponse.json({ error: 'No active subscription' }, { status: 403 });
    }

    return NextResponse.json({ status: 'active' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
