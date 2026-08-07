/**
 * 이메일 발송 인터페이스 및 스텁 구현 (F033, Task 605)
 *
 * 이 파일은 이번 단계에서 **실제 메일을 발송하지 않는다.** 발송 인터페이스와
 * 입력 검증 규칙만 정의하고, 호출 시 스텁 결과를 반환한다. 실제 제공자 연동
 * (Resend API 호출, 헤더 인젝션 차단, 속도 제한 등)은 Task 613에서 구현한다.
 *
 * ## 이메일 제공자 비교 및 선정 근거
 *
 * | 기준                     | Resend                          | Nodemailer + SMTP              |
 * | ------------------------ | -------------------------------- | -------------------------------- |
 * | Vercel 서버리스 적합성   | 적합 (HTTP API, 콜드스타트 영향 적음) | 부적합할 수 있음 (SMTP 연결 유지 비용, 서버리스 환경에서 커넥션 풀링 어려움) |
 * | 설정 난이도              | 낮음 (API 키 1개)                | 높음 (SMTP 호스트/포트/인증 정보, 발신 도메인 SPF/DKIM 별도 설정) |
 * | 전달률(deliverability)   | 도메인 인증 시 양호               | 발신 서버·도메인 평판에 전적으로 의존 |
 * | 프로젝트 규모 대비 비용  | 무료 티어로 MVP 충분              | 무료 SMTP(Gmail 등)는 발송량 제한이 엄격하고 서비스 약관상 부적합 |
 *
 * **결론(권장안): Resend.** Vercel과 동일 생태계에서 검증된 서버리스 친화적 API이며,
 * 신규 의존성을 `resend` 패키지 1건으로 최소화할 수 있다. 최종 확정은 Task 613에서
 * 실제 발송 구현 시점에 재확인한다.
 *
 * ## 필요한 환경 변수 (Task 613에서 실사용, `.env.example`에 문서화됨)
 * - `EMAIL_API_KEY`: Resend API 키 (서버 전용, `NEXT_PUBLIC_` 접두사 사용 금지)
 * - `EMAIL_FROM_ADDRESS`: 발신자 주소 (Resend에 인증된 도메인이어야 함)
 */

import type { EmailShareRequest, EmailSendResult } from './types';
import { EMAIL_SHARE_LIMITS } from './types';

/**
 * 이메일 발송기 인터페이스
 * Task 613에서 Resend 기반 구현체가 이 인터페이스를 구현한다.
 */
export interface EmailSender {
  send(request: EmailShareRequest, shareUrl: string): Promise<EmailSendResult>;
}

/**
 * 이메일 공유 요청 입력 검증 결과
 */
export type EmailShareValidationResult = { valid: true } | { valid: false; errors: string[] };

/**
 * 이메일 공유 요청의 입력값을 검증
 * 클라이언트(Task 609)와 서버(Task 613) 양쪽에서 동일한 규칙을 재사용하기 위해
 * 이 함수를 공용으로 둔다. (서버는 이 결과를 신뢰하지 않고 반드시 재검증할 것 — 보안 경계 절 참조)
 *
 * @param request 검증할 이메일 공유 요청
 * @returns 검증 결과 (실패 시 사용자 친화적 에러 메시지 목록)
 */
export function validateEmailShareRequest(request: EmailShareRequest): EmailShareValidationResult {
  const errors: string[] = [];

  if (!request.recipientEmail || !EMAIL_SHARE_LIMITS.EMAIL_PATTERN.test(request.recipientEmail)) {
    errors.push('올바른 이메일 형식이 아닙니다.');
  }
  if (EMAIL_SHARE_LIMITS.FORBIDDEN_HEADER_CHARS.test(request.recipientEmail)) {
    errors.push('수신자 이메일에 허용되지 않는 문자가 포함되어 있습니다.');
  }

  if (!request.subject || request.subject.trim().length === 0) {
    errors.push('제목을 입력해주세요.');
  } else if (request.subject.length > EMAIL_SHARE_LIMITS.SUBJECT_MAX_LENGTH) {
    errors.push(`제목은 ${EMAIL_SHARE_LIMITS.SUBJECT_MAX_LENGTH}자를 초과할 수 없습니다.`);
  }
  if (EMAIL_SHARE_LIMITS.FORBIDDEN_HEADER_CHARS.test(request.subject)) {
    errors.push('제목에 허용되지 않는 문자(개행)가 포함되어 있습니다.');
  }

  if (!request.message || request.message.trim().length === 0) {
    errors.push('본문 메시지를 입력해주세요.');
  } else if (request.message.length > EMAIL_SHARE_LIMITS.MESSAGE_MAX_LENGTH) {
    errors.push(`본문은 ${EMAIL_SHARE_LIMITS.MESSAGE_MAX_LENGTH}자를 초과할 수 없습니다.`);
  }

  if (!request.notionPageId) {
    errors.push('대상 견적서 정보가 누락되었습니다.');
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

/**
 * Resend 기반 이메일 발송기 (Task 613)
 * Resend API를 사용하여 실제 이메일을 발송한다.
 * 환경 변수 EMAIL_API_KEY가 없으면 스텁 모드로 동작한다.
 */
export class ResendEmailSender implements EmailSender {
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.EMAIL_API_KEY || null;
  }

  async send(request: EmailShareRequest, shareUrl: string): Promise<EmailSendResult> {
    const validation = validateEmailShareRequest(request);
    if (!validation.valid) {
      return {
        success: false,
        failureReason: validation.errors.join(' '),
      };
    }

    // API 키 미설정 시 스텁 모드
    if (!this.apiKey) {
      console.debug('[email:resend] API 키 미설정, 스텁 모드로 동작', {
        to: request.recipientEmail,
        subject: request.subject,
      });
      return {
        success: true,
        providerMessageId: `stub_${Date.now()}`,
      };
    }

    try {
      // HTML 본문 구성
      const htmlBody = this.buildHtmlEmail(request.message, shareUrl);

      // Resend API 호출 (Node.js fetch 사용, 별도 패키지 불필요)
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com',
          to: request.recipientEmail,
          subject: request.subject,
          html: htmlBody,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          typeof errorData === 'object' && errorData !== null && 'message' in errorData
            ? String(errorData.message)
            : `이메일 발송 서비스 오류 (${response.status})`;

        console.error('[email:resend] 발송 실패', {
          status: response.status,
          error: errorMessage,
          to: request.recipientEmail,
        });

        return {
          success: false,
          failureReason: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.',
        };
      }

      const data = await response.json();
      const messageId =
        typeof data === 'object' && data !== null && 'id' in data
          ? String(data.id)
          : `msg_${Date.now()}`;

      console.debug('[email:resend] 발송 성공', {
        to: request.recipientEmail,
        messageId,
      });

      return {
        success: true,
        providerMessageId: messageId,
      };
    } catch (error) {
      console.error('[email:resend] 예외 발생', {
        error: error instanceof Error ? error.message : String(error),
        to: request.recipientEmail,
      });

      return {
        success: false,
        failureReason: '이메일 발송 중 오류가 발생했습니다. 관리자에게 문의해주세요.',
      };
    }
  }

  /**
   * HTML 이메일 본문 생성
   */
  private buildHtmlEmail(userMessage: string, shareUrl: string): string {
    // 사용자 메시지에서 HTML 특수문자 이스케이프 (XSS 방지)
    const escapeHtml = (text: string): string => {
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return text.replace(/[&<>"']/g, (char) => map[char]);
    };

    const escapedMessage = escapeHtml(userMessage);

    return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f5f5f5; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background-color: #ffffff; border: 1px solid #e0e0e0; padding: 20px; }
    .footer { background-color: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background-color: #0066cc; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin-top: 20px; }
    .divider { border-top: 1px solid #e0e0e0; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">견적서 공유</h1>
    </div>
    <div class="content">
      <p>안녕하세요,</p>
      <div style="white-space: pre-wrap; background-color: #f9f9f9; padding: 12px; border-left: 3px solid #0066cc; margin: 16px 0;">
${escapedMessage}
      </div>
      <div class="divider"></div>
      <p>아래 버튼을 클릭하여 견적서를 확인해주세요:</p>
      <a href="${escapeHtml(shareUrl)}" class="button">견적서 보기</a>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        위 버튼이 작동하지 않으면 다음 링크를 복사하여 브라우저에 붙여넣어주세요:<br>
        <code style="background-color: #f5f5f5; padding: 4px 8px; border-radius: 4px;">${escapeHtml(shareUrl)}</code>
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0; font-size: 12px; color: #666;">
        이 이메일은 자동으로 발송되었습니다. 궁금한 점이 있으시면 발송인에게 문의해주세요.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

/**
 * 현재 활성화된 이메일 발송기
 * Resend 기반 구현체 (API 키 없으면 스텁 모드)
 */
export const emailSender: EmailSender = new ResendEmailSender();
