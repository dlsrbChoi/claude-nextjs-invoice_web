/**
 * Next.js Proxy (Next.js 16부터 middleware.ts를 대체하는 파일 컨벤션)
 * /admin, /api/admin 경로의 세션 검증
 *
 * Next.js 16.2.12 기준 `proxy`는 Node.js 런타임을 기본으로 사용하므로
 * (docs: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 * "v16.0.0 | Proxy defaults to the Node.js runtime"), Node 내장 `crypto` 기반의
 * `src/lib/auth.ts`(HMAC 서명 검증)를 Edge 폴리필 없이 그대로 사용할 수 있다.
 *
 * 이전 구현(middleware.ts)은 쿠키의 **존재 여부만** 검증하여, 공격자가
 * `admin_session=아무값`이라는 쿠키만 설정해도 인증을 우회할 수 있는 취약점이 있었다.
 * 이 파일은 서명(HMAC-SHA256) 검증과 만료 시각(exp) 검증을 모두 수행한다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // /admin 또는 /api/admin으로 시작하는 경로만 보호
  const isProtectedPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const result = verifySessionToken(sessionCookie?.value);

  if (!result.valid) {
    // API 라우트는 리다이렉트 대신 401 JSON 응답을 반환하여 클라이언트가 처리하기 쉽게 함
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json(
        { error: '인증이 필요합니다.', reason: result.reason },
        { status: 401 }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Proxy를 적용할 경로
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
