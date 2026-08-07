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
 * 스텁 이메일 발송기
 * 실제 네트워크 호출 없이 항상 성공 결과를 반환한다.
 * Task 609(UI)에서 발송 흐름을 시뮬레이션하는 데 사용되며, Task 613에서
 * Resend 기반 구현체로 교체된다.
 */
export class StubEmailSender implements EmailSender {
  async send(request: EmailShareRequest, shareUrl: string): Promise<EmailSendResult> {
    const validation = validateEmailShareRequest(request);
    if (!validation.valid) {
      return {
        success: false,
        failureReason: validation.errors.join(' '),
      };
    }

    // 스텁 구현: 실제 발송 없이 지연을 흉내 내고 성공 응답을 반환
    console.debug('[email:stub] 발송 시뮬레이션', {
      to: request.recipientEmail,
      subject: request.subject,
      shareUrl,
    });

    return {
      success: true,
      providerMessageId: `stub_${Date.now()}`,
    };
  }
}

/**
 * 현재 활성화된 이메일 발송기
 * Task 613에서 실제 구현체로 교체될 때까지 스텁을 사용한다.
 */
export const emailSender: EmailSender = new StubEmailSender();
