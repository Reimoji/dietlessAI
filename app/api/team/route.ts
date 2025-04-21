import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get team data with members for the current user
    const teamMember = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, session.user.id),
      with: {
        team: true,
        user: {
          columns: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!teamMember?.team) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 });
    }

    // Get all team members
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

    return NextResponse.json({
      id: teamMember.team.id,
      name: teamMember.team.name,
      planName: teamMember.team.planName,
      subscriptionStatus: teamMember.team.subscriptionStatus,
      teamMembers: allTeamMembers
    });
  } catch (error) {
    console.error('Team API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team data' },
      { status: 500 }
    );
  }
}