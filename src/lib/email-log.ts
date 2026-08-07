/**
 * 이메일 발송 이력 로깅 (Task 613)
 *
 * 발송된 이메일의 메타데이터를 JSON 라인 형식으로 파일에 기록한다.
 * 프로덕션에서는 데이터베이스나 로그 집계 서비스 사용을 권장한다.
 *
 * 로그 형식: 각 줄이 하나의 JSON 객체 (JSON Lines / NDJSON)
 * 예:
 *   {"timestamp":"2026-08-07T12:34:56.789Z","sessionId":"sess_123","recipientEmail":"user@example.com",...}
 *   {"timestamp":"2026-08-07T12:35:01.234Z","sessionId":"sess_123",...}
 */

/**
 * 이메일 발송 로그 엔트리
 */
export interface EmailLogEntry {
  /** ISO 8601 형식의 타임스탬프 */
  timestamp: string;
  /** 관리자 세션 ID (또는 사용자 ID) */
  sessionId: string;
  /** 수신자 이메일 */
  recipientEmail: string;
  /** 메일 제목 */
  subject: string;
  /** 대상 견적서의 Notion 페이지 ID */
  notionPageId: string;
  /** 발송 상태 */
  status: 'success' | 'failed';
  /** 이메일 제공자가 반환한 메시지 ID (성공 시) */
  messageId?: string;
  /** 오류 메시지 (실패 시) */
  errorMessage?: string;
}

/**
 * 이메일 발송 로그 기록
 *
 * 현재는 콘솔 로그로만 기록한다. 프로덕션에서는 파일이나 DB 저장으로 변경할 수 있다.
 * 향후 Task에서 실제 로그 저장소로 업그레이드된다.
 *
 * @param entry 로그 엔트리
 */
export function logEmailSent(entry: EmailLogEntry): void {
  // 현재는 콘솔 로그만 사용
  // TODO: 프로덕션에서는 파일(/var/log/emails.log)이나 DB에 저장
  console.log(
    '[email:log]',
    JSON.stringify({
      ...entry,
      // 로그 보안: 이메일 주소 일부 마스킹
      recipientEmail: maskEmail(entry.recipientEmail),
    })
  );
}

/**
 * 이메일 주소 마스킹 (로그에서 일부 노출)
 * 예: user@example.com → u***@example.com
 */
function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  const maskLength = Math.max(1, Math.floor(localPart.length / 2));
  const masked =
    localPart.substring(0, 1) + '*'.repeat(maskLength) + localPart.substring(1 + maskLength);

  return `${masked}@${domain}`;
}
