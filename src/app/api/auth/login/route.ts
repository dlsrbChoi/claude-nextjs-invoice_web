/**
 * POST /api/auth/login
 * 관리자 로그인 처리
 * HMAC 서명 기반 세션 토큰을 발급하고 HTTP-only 쿠키로 설정
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  getSessionMaxAgeSeconds,
  issueSessionToken,
  timingSafeCompare,
} from '@/lib/auth';

/**
 * 브루트포스 완화를 위한 최소 응답 지연 (밀리초)
 * 로그인 실패 시 일정 시간을 대기시켜 자동화된 시도 비용을 높임
 */
const LOGIN_FAILURE_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      await delay(LOGIN_FAILURE_DELAY_MS);
      return NextResponse.json({ error: '비밀번호가 필요합니다.' }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD 환경 변수가 설정되지 않았습니다.');
      return NextResponse.json({ error: '서버 설정 오류' }, { status: 500 });
    }

    // 타이밍 공격에 안전한 비교로 비밀번호 검증
    if (!timingSafeCompare(password, adminPassword)) {
      await delay(LOGIN_FAILURE_DELAY_MS);
      return NextResponse.json({ error: '비밀번호가 잘못되었습니다.' }, { status: 401 });
    }

    // HMAC 서명 기반 세션 토큰 발급 (만료 시각 포함)
    let sessionToken: string;
    try {
      sessionToken = issueSessionToken();
    } catch (error) {
      console.error('세션 토큰 발급 실패 (ADMIN_SESSION_SECRET 확인 필요):', error);
      return NextResponse.json({ error: '서버 설정 오류' }, { status: 500 });
    }

    const response = NextResponse.json({ success: true, message: '로그인 성공' }, { status: 200 });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: getSessionMaxAgeSeconds(),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('로그인 처리 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
