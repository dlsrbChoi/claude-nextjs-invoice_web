/**
 * Next.js 미들웨어
 * /admin 경로 인증 보호
 * 세션 쿠키 검증
 */

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // /admin으로 시작하는 경로 보호
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('admin_session');

    // 세션 쿠키 없으면 로그인 페이지로 리다이렉트
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// 미들웨어를 적용할 경로
export const config = {
  matcher: [
    /*
     * /admin으로 시작하는 모든 경로
     * /api/admin으로 시작하는 모든 경로
     */
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
