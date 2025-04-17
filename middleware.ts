import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';

const protectedRoutes = '/dashboard';
const subscriberRoutes = '/dashboard/chat';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = pathname.startsWith(protectedRoutes);
  const isSubscriberRoute = pathname.startsWith(subscriberRoutes);

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isSubscriberRoute) {
    try {
      const parsed = await verifyToken(sessionCookie?.value || '');
      // Add subscription check from team data
      const response = await fetch(`${request.nextUrl.origin}/api/teams/subscription`, {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
      });
      
      if (!response.ok) {
        return NextResponse.redirect(new URL('/pricing', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/pricing', request.url));
    }
  }

  let res = NextResponse.next();

  if (sessionCookie && request.method === "GET") {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString(),
        }),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresInOneDay,
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
