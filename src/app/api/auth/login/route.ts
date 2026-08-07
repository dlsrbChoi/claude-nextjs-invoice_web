/**
 * POST /api/auth/login
 * 관리자 로그인 처리
 * HTTP-only 세션 쿠키 설정
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: '비밀번호가 필요합니다.' }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD 환경 변수가 설정되지 않았습니다.');
      return NextResponse.json({ error: '서버 설정 오류' }, { status: 500 });
    }

    // 비밀번호 검증
    if (password !== adminPassword) {
      return NextResponse.json({ error: '비밀번호가 잘못되었습니다.' }, { status: 401 });
    }

    // 세션 토큰 생성 (간단한 UUID 기반)
    const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // 응답 생성
    const response = NextResponse.json({ success: true, message: '로그인 성공' }, { status: 200 });

    // HTTP-only 세션 쿠키 설정 (60분 유효)
    response.cookies.set({
      name: 'admin_session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 60분
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('로그인 처리 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
