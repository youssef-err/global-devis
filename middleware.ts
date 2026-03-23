import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'ar', 'fr', 'es', 'pt', 'de', 'it', 'nl', 'tr', 'ru'],
  defaultLocale: 'en'
});

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    /\.(ico|png|svg|webp|jpg|jpeg|gif)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const localeMatch = pathname.match(/^\/(en|ar|fr|es|pt|de|it|nl|tr|ru)/);
  const locale = localeMatch ? localeMatch[1] : 'en';
  const pathWithoutLocale = pathname.replace(/^\/(en|ar|fr|es|pt|de|it|nl|tr|ru)/, '') || '/';

  const isPublic =
    pathWithoutLocale === '/login' ||
    pathWithoutLocale === '/signup' ||
    pathname.startsWith('/auth');

  if (!user && !isPublic && pathname !== '/' && localeMatch && pathWithoutLocale !== '/') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/login`;
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (pathWithoutLocale === '/login' || pathWithoutLocale === '/signup')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}`;
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ['/', '/(en|ar|fr|es|pt|de|it|nl|tr|ru)/:path*', '/auth/:path*']
};
