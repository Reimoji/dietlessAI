import { verifyToken } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function checkSubscription() {
  // Get the session cookie - await the cookies() function
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie?.value) {
    return false;
  }

  try {
    // Verify the JWT token
    const parsed = await verifyToken(sessionCookie.value);
    if (!parsed?.user?.id) {
      return false;
    }

    // Find the team member with their team
    const teamMember = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, parsed.user.id),
      with: {
        team: true,
      },
    });

    if (!teamMember?.team) {
      return false;
    }

    // Check if subscription is active or trialing
    const status = teamMember.team.subscriptionStatus;
    return status === 'active' || status === 'trialing';
  } catch (error) {
    console.error('Subscription check error:', error);
    return false;
  }
}

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  // Check subscription status server-side
  const hasValidSubscription = await checkSubscription();

  // Redirect if not subscribed
  if (!hasValidSubscription) {
    redirect('/pricing');
  }

  return <>{children}</>;
}
