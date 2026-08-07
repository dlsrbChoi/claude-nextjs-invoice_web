/**
 * 이메일 발송 API 엔드포인트 (Task 613)
 * POST /api/admin/share-email
 *
 * 관리자가 견적서 공유 링크를 클라이언트에게 이메일로 발송하는 엔드포인트.
 *
 * 보안 구현:
 * - 세션 토큰 검증 (HMAC-SHA256)
 * - 서버 측 입력 검증 및 재검증
 * - 헤더 인젝션 방지 (개행 문자 제거)
 * - XSS 방지 (HTML 이스케이프)
 * - 속도 제한 (분당 5건, 시간당 30건)
 * - 발송 이력 로깅
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { validateEmailShareRequestServer } from '@/lib/email-validation';
import { rateLimiter } from '@/lib/rate-limiter';
import { logEmailSent } from '@/lib/email-log';
import { emailSender } from '@/lib/email';
import type { EmailShareRequest } from '@/lib/types';

/**
 * POST /api/admin/share-email
 *
 * @body {
 *   recipientEmail: string,
 *   subject: string,
 *   message: string,
 *   notionPageId: string
 * }
 *
 * @returns {
 *   200: { success: true, message: string, messageId: string }
 *   400: { error: string, details?: string[] }
 *   401: { error: string }
 *   429: { error: string, retryAfter: number }
 *   500: { error: string }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Content-Type 검증
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: '요청 형식이 올바르지 않습니다. application/json을 사용해주세요.' },
        { status: 400 }
      );
    }

    // Step 2: 요청 본문 파싱
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: '요청 본문을 파싱할 수 없습니다.' }, { status: 400 });
    }

    // Step 3: 세션 검증
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    const sessionToken = sessionCookie?.value;

    const verification = verifySessionToken(sessionToken);
    if (!verification.valid) {
      console.warn('[api:share-email] 세션 검증 실패', {
        reason: verification.reason,
      });

      const message =
        verification.reason === 'expired'
          ? '세션이 만료되었습니다. 다시 로그인해주세요.'
          : '인증이 필요합니다.';

      return NextResponse.json({ error: message }, { status: 401 });
    }

    const sessionId = `session_${Math.random().toString(36).slice(2, 11)}`;

    // Step 4: 입력 검증 (서버 측 재검증)
    const validation = validateEmailShareRequestServer(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: '입력 값이 유효하지 않습니다.', details: validation.errors },
        { status: 400 }
      );
    }

    const validatedData = validation.data as EmailShareRequest;

    // Step 5: 속도 제한 체크
    const rateLimit = rateLimiter.check(sessionId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: '너무 많은 요청이 발생했습니다.',
          message: '1분 이내에 최대 5건까지만 발송 가능합니다. 잠시 후 다시 시도해주세요.',
        },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // Step 6: 공유 URL 구성
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${appUrl}/invoice/${validatedData.notionPageId}`;

    // Step 7: 이메일 발송
    const sendResult = await emailSender.send(validatedData, shareUrl);

    if (!sendResult.success) {
      // 발송 실패 로깅
      logEmailSent({
        timestamp: new Date().toISOString(),
        sessionId,
        recipientEmail: validatedData.recipientEmail,
        subject: validatedData.subject,
        notionPageId: validatedData.notionPageId,
        status: 'failed',
        errorMessage: sendResult.failureReason,
      });

      return NextResponse.json(
        { error: sendResult.failureReason || '이메일 발송에 실패했습니다.' },
        { status: 500 }
      );
    }

    // Step 8: 발송 성공 로깅
    logEmailSent({
      timestamp: new Date().toISOString(),
      sessionId,
      recipientEmail: validatedData.recipientEmail,
      subject: validatedData.subject,
      notionPageId: validatedData.notionPageId,
      status: 'success',
      messageId: sendResult.providerMessageId,
    });

    // Step 9: 성공 응답
    return NextResponse.json(
      {
        success: true,
        message: '이메일이 성공적으로 발송되었습니다.',
        messageId: sendResult.providerMessageId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[api:share-email] 예외 발생', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({ error: '내부 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
