import { signToken, verifyToken } from '@/lib/auth/session';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const protectedRoutes = '/dashboard';
const SUPPORTED_LANGS = ['en', 'et'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const preferredLangCookie = request.cookies.get('preferred-lang');
  const isProtectedRoute = pathname.startsWith(protectedRoutes);

  console.log('Middleware: Processing request for path:', pathname);

  // 1. Locale handling
  if (pathname === '/') {
    // Root → redirect to preferred language or default
    const preferredLang = preferredLangCookie?.value && SUPPORTED_LANGS.includes(preferredLangCookie.value) 
      ? preferredLangCookie.value 
      : 'en';
    return NextResponse.redirect(new URL(`/${preferredLang}`, request.url));
  }

  // Already has supported lang
  const startsWithLang = SUPPORTED_LANGS.some((lang) =>
    pathname.startsWith(`/${lang}`)
  );

  if (
    !startsWithLang &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next')
  ) {
    // Prefix with preferred locale or default (en)
    const preferredLang = preferredLangCookie?.value && SUPPORTED_LANGS.includes(preferredLangCookie.value) 
      ? preferredLangCookie.value 
      : 'en';
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLang}${pathname}`;
    return NextResponse.redirect(url);
  }

  // 2. Auth handling
  if (isProtectedRoute && !sessionCookie) {
    console.log('Middleware: No session cookie found, redirecting to sign-up');
    const locale =
      SUPPORTED_LANGS.find((lang) => pathname.startsWith(`/${lang}`)) || 'en';

    return NextResponse.redirect(
      new URL(`/${locale}/sign-up`, request.url)
    );
  }

  let res = NextResponse.next();

  if (sessionCookie && request.method === 'GET') {
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
        const url = request.nextUrl.clone();
        url.pathname = `/en/sign-in`;
        return NextResponse.redirect(url);
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!api/stripe/webhook|api/webhooks|api/internal|_next/static|_next/image|favicon.ico|images/).*)',
  ],
};