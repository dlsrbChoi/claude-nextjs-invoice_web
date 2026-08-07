/**
 * POST /api/auth/logout
 * 관리자 로그아웃 처리
 * 세션 쿠키 삭제
 */

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: '로그아웃 성공' },
      { status: 200 }
    );

    // 세션 쿠키 삭제 (maxAge: 0)
    response.cookies.set({
      name: 'admin_session',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('로그아웃 처리 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
