import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['en', 'zh', 'ar'];
const DEFAULT_LOCALE = 'en';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if pathname starts with a locale
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If pathname already has a locale, let it through
  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // If pathname is just "/", redirect to default locale
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}`, request.url)
    );
  }

  // For any other path without locale, add the default locale
  return NextResponse.redirect(
    new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url)
  );
}

export const config = {
  matcher: [
    // Match all pathnames except those starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder files
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
