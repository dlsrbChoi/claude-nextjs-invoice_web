/**
 * 이메일 발송 요청 검증 유틸리티 (Task 613)
 * 서버 측 입력 검증, 헤더 인젝션 차단, HTML 이스케이프 등을 담당한다.
 */

import { EMAIL_SHARE_LIMITS, type EmailShareRequest } from './types';

/**
 * 이메일 주소 검증 (RFC 5322 간소화 버전)
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  if (email.length > 254) return false; // RFC 5321
  return EMAIL_SHARE_LIMITS.EMAIL_PATTERN.test(email);
}

/**
 * 헤더 인젝션 방지: 개행 문자 포함 여부 확인
 */
export function hasHeaderInjectionChars(text: string): boolean {
  return EMAIL_SHARE_LIMITS.FORBIDDEN_HEADER_CHARS.test(text);
}

/**
 * Notion 페이지 ID 형식 검증
 * 지원 형식:
 * - 32자 16진수: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
 * - 하이픈 포함 UUID: a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
 */
export function isValidNotionPageId(pageId: string): boolean {
  if (!pageId) return false;
  // 32자 16진수 또는 8-4-4-4-12 UUID 형식
  const patterns = [
    /^[a-f0-9]{32}$/,
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
  ];
  return patterns.some((p) => p.test(pageId.toLowerCase()));
}

/**
 * HTML 이스케이프: XSS 방지
 * 사용자 입력이 메일 본문에 HTML로 포함될 때 사용
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * 헤더 안전 문자열 (개행 제거)
 * 이메일 헤더로 사용되는 필드(subject, recipient email)에서 개행 제거
 */
export function sanitizeEmailHeader(text: string): string {
  return text.replace(/[\r\n]/g, '');
}

/**
 * 이메일 공유 요청의 서버 측 검증 (재검증)
 * 클라이언트 측 검증은 UX용이므로, 서버에서는 반드시 재검증해야 한다.
 *
 * @param request 요청 데이터
 * @returns 검증 결과
 */
export function validateEmailShareRequestServer(
  request: unknown
): { valid: true; data: EmailShareRequest } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  // 기본 타입 검증
  if (!request || typeof request !== 'object') {
    errors.push('잘못된 요청 형식입니다.');
    return { valid: false, errors };
  }

  const req = request as Record<string, unknown>;

  // recipientEmail 검증
  const recipientEmail = String(req.recipientEmail || '').trim();
  if (!recipientEmail) {
    errors.push('수신자 이메일을 입력해주세요.');
  } else if (!isValidEmail(recipientEmail)) {
    errors.push('올바른 이메일 형식이 아닙니다.');
  } else if (hasHeaderInjectionChars(recipientEmail)) {
    errors.push('수신자 이메일에 허용되지 않는 문자가 포함되어 있습니다.');
  }

  // subject 검증
  const subject = String(req.subject || '').trim();
  if (!subject) {
    errors.push('제목을 입력해주세요.');
  } else if (subject.length > EMAIL_SHARE_LIMITS.SUBJECT_MAX_LENGTH) {
    errors.push(`제목은 ${EMAIL_SHARE_LIMITS.SUBJECT_MAX_LENGTH}자를 초과할 수 없습니다.`);
  } else if (hasHeaderInjectionChars(subject)) {
    errors.push('제목에 허용되지 않는 문자(개행)가 포함되어 있습니다.');
  }

  // message 검증
  const message = String(req.message || '').trim();
  if (!message) {
    errors.push('본문 메시지를 입력해주세요.');
  } else if (message.length > EMAIL_SHARE_LIMITS.MESSAGE_MAX_LENGTH) {
    errors.push(`본문은 ${EMAIL_SHARE_LIMITS.MESSAGE_MAX_LENGTH}자를 초과할 수 없습니다.`);
  }

  // notionPageId 검증
  const notionPageId = String(req.notionPageId || '').trim();
  if (!notionPageId) {
    errors.push('대상 견적서 정보가 누락되었습니다.');
  } else if (!isValidNotionPageId(notionPageId)) {
    errors.push('잘못된 견적서 ID 형식입니다.');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      recipientEmail: sanitizeEmailHeader(recipientEmail),
      subject: sanitizeEmailHeader(subject),
      message,
      notionPageId,
    },
  };
}
