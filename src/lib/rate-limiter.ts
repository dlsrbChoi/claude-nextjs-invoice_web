/**
 * 속도 제한(Rate Limiting) 구현 (Task 613)
 *
 * 현재는 메모리 기반 구현으로, 서버 재시작 시 초기화된다.
 * 프로덕션에서는 Redis 같은 공유 저장소 사용을 권장한다.
 *
 * 세션 기반 속도 제한:
 * - 분당(1분): 5건
 * - 시간당(60분): 30건
 *
 * 초과 시 429 Too Many Requests 응답
 */

/**
 * 요청 기록 항목
 */
interface RequestRecord {
  timestamp: number; // Unix timestamp (ms)
}

/**
 * 세션별 요청 기록
 */
interface SessionRecords {
  requests: RequestRecord[];
}

/**
 * 메모리 기반 속도 제한기
 */
class MemoryRateLimiter {
  private records: Map<string, SessionRecords> = new Map();
  private readonly perMinute: number;
  private readonly perHour: number;

  constructor(perMinute: number = 5, perHour: number = 30) {
    this.perMinute = perMinute;
    this.perHour = perHour;

    // 주기적으로 오래된 기록 정리 (메모리 누수 방지)
    // 5분마다 1시간 이상 지난 기록 제거
    setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000
    );
  }

  /**
   * 요청 체크 및 기록
   *
   * @param sessionId 세션 또는 사용자 ID
   * @returns { allowed: boolean, remaining: number }
   *   - allowed: 요청 허용 여부
   *   - remaining: 남은 요청 횟수 (허용 시) 또는 -1 (거부 시)
   */
  check(sessionId: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    // 이 세션의 기록 조회 또는 초기화
    if (!this.records.has(sessionId)) {
      this.records.set(sessionId, { requests: [] });
    }

    const session = this.records.get(sessionId)!;
    const requests = session.requests;

    // 1시간 이상 지난 요청 제거
    session.requests = requests.filter((r) => r.timestamp > oneHourAgo);

    // 분당 상한 체크
    const recentMinute = session.requests.filter((r) => r.timestamp > oneMinuteAgo);
    if (recentMinute.length >= this.perMinute) {
      return { allowed: false, remaining: -1 };
    }

    // 시간당 상한 체크
    if (session.requests.length >= this.perHour) {
      return { allowed: false, remaining: -1 };
    }

    // 요청 기록
    session.requests.push({ timestamp: now });

    // 남은 요청 횟수 (분당 기준)
    const remaining = Math.max(0, this.perMinute - recentMinute.length - 1);

    return { allowed: true, remaining };
  }

  /**
   * 오래된 기록 정리
   */
  private cleanup(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    for (const [sessionId, session] of this.records.entries()) {
      session.requests = session.requests.filter((r) => r.timestamp > oneHourAgo);

      // 요청이 없는 세션 제거
      if (session.requests.length === 0) {
        this.records.delete(sessionId);
      }
    }
  }

  /**
   * 모든 기록 초기화 (테스트용)
   */
  reset(): void {
    this.records.clear();
  }

  /**
   * 특정 세션 기록 초기화 (테스트용)
   */
  resetSession(sessionId: string): void {
    this.records.delete(sessionId);
  }
}

// 전역 인스턴스
const rateLimiter = new MemoryRateLimiter(5, 30);

export { MemoryRateLimiter, rateLimiter };
