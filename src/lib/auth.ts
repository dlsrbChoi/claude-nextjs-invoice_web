/**
 * 관리자 인증 유틸리티
 * HMAC-SHA256 서명 기반 세션 토큰 발급 및 검증
 *
 * 배경: 기존 구현은 `admin_${Date.now()}_${random}` 형태의 평문 토큰을
 * 서버 검증 없이 쿠키 존재 여부만으로 신뢰했다. 이는 임의의 쿠키 값으로
 * 인증을 우회할 수 있는 취약점이었다 (docs/ROADMAP.md 보안 경계 절 참조).
 *
 * 이 모듈은 Node.js 내장 `crypto`만 사용하며 신규 의존성을 도입하지 않는다.
 * 미들웨어(Edge 런타임)에서는 이 모듈 대신 `src/lib/auth-edge.ts`의
 * Web Crypto 기반 함수를 사용해야 한다 (Node `crypto` 모듈은 Edge에서 사용 불가).
 */

import { createHmac, timingSafeEqual } from 'crypto';

/**
 * 세션 토큰 페이로드
 */
export interface SessionPayload {
  /** 토큰 발급 시각 (Unix epoch, 초) */
  iat: number;
  /** 토큰 만료 시각 (Unix epoch, 초) */
  exp: number;
}

const TOKEN_VERSION = 'v1';
const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60; // 60분 (기존 정책 유지)

/**
 * 환경 변수에서 세션 서명 비밀키를 조회
 * 미설정 시 서버가 즉시 실패하도록 예외를 던짐 (평문 토큰으로의 조용한 폴백 방지)
 */
function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      'ADMIN_SESSION_SECRET 환경 변수가 설정되지 않았습니다. .env.local을 확인하세요.'
    );
  }
  return secret;
}

/**
 * 세션 최대 유효 기간(초)을 환경 변수에서 조회
 * ADMIN_SESSION_MAX_AGE 미설정 시 기본값(60분) 사용
 */
export function getSessionMaxAgeSeconds(): number {
  const raw = process.env.ADMIN_SESSION_MAX_AGE;
  if (!raw) return DEFAULT_SESSION_MAX_AGE_SECONDS;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.warn(
      `ADMIN_SESSION_MAX_AGE 값이 유효하지 않습니다(${raw}). 기본값(${DEFAULT_SESSION_MAX_AGE_SECONDS}초)을 사용합니다.`
    );
    return DEFAULT_SESSION_MAX_AGE_SECONDS;
  }
  return parsed;
}

/**
 * 페이로드를 base64url로 인코딩
 */
function base64UrlEncode(input: string): string {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * base64url 문자열을 디코딩
 */
function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  return Buffer.from(padded + padding, 'base64').toString('utf8');
}

/**
 * HMAC-SHA256 서명 생성
 */
function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

/**
 * 서명된 세션 토큰 발급
 * 형식: v1.<base64url(payload json)>.<base64url(hmac signature)>
 *
 * @param maxAgeSeconds 토큰 유효 기간(초). 미지정 시 ADMIN_SESSION_MAX_AGE 또는 기본값 사용
 * @returns 서명된 세션 토큰 문자열
 */
export function issueSessionToken(maxAgeSeconds?: number): string {
  const secret = getSessionSecret();
  const now = Math.floor(Date.now() / 1000);
  const maxAge = maxAgeSeconds ?? getSessionMaxAgeSeconds();

  const payload: SessionPayload = {
    iat: now,
    exp: now + maxAge,
  };

  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(`${TOKEN_VERSION}.${payloadEncoded}`, secret);

  return `${TOKEN_VERSION}.${payloadEncoded}.${signature}`;
}

/**
 * 세션 토큰 검증 결과
 */
export type SessionVerifyResult =
  | { valid: true; payload: SessionPayload }
  | { valid: false; reason: 'malformed' | 'signature_mismatch' | 'expired' | 'config_error' };

/**
 * 세션 토큰의 서명과 만료 여부를 검증
 * 타이밍 공격 방지를 위해 `crypto.timingSafeEqual`로 서명을 비교
 *
 * @param token 쿠키에서 읽은 세션 토큰
 * @returns 검증 결과 (유효하면 payload 포함)
 */
export function verifySessionToken(token: string | undefined | null): SessionVerifyResult {
  if (!token) {
    return { valid: false, reason: 'malformed' };
  }

  let secret: string;
  try {
    secret = getSessionSecret();
  } catch {
    return { valid: false, reason: 'config_error' };
  }

  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== TOKEN_VERSION) {
    return { valid: false, reason: 'malformed' };
  }

  const [version, payloadEncoded, signature] = parts;
  const expectedSignature = sign(`${version}.${payloadEncoded}`, secret);

  // 길이가 다르면 timingSafeEqual이 예외를 던지므로 먼저 확인
  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (signatureBuf.length !== expectedBuf.length || !timingSafeEqual(signatureBuf, expectedBuf)) {
    return { valid: false, reason: 'signature_mismatch' };
  }

  let payload: SessionPayload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadEncoded));
  } catch {
    return { valid: false, reason: 'malformed' };
  }

  if (
    typeof payload.exp !== 'number' ||
    typeof payload.iat !== 'number' ||
    !Number.isFinite(payload.exp)
  ) {
    return { valid: false, reason: 'malformed' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    return { valid: false, reason: 'expired' };
  }

  return { valid: true, payload };
}

/**
 * 관리자 비밀번호를 타이밍 공격에 안전하게 비교
 * 길이가 다른 경우에도 타이밍 차이를 최소화하기 위해 두 값을 동일 길이로 맞춘 뒤 비교
 *
 * @param input 사용자가 입력한 비밀번호
 * @param expected 환경 변수에 설정된 정답 비밀번호
 * @returns 일치 여부
 */
export function timingSafeCompare(input: string, expected: string): boolean {
  const inputBuf = Buffer.from(input, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');

  if (inputBuf.length !== expectedBuf.length) {
    // 길이가 다르면 즉시 false를 반환하되, expectedBuf와 같은 길이의 더미 비교를 수행하여
    // "길이 불일치로 인한 즉시 반환"과 "내용 불일치"의 타이밍 차이를 줄인다.
    timingSafeEqual(expectedBuf, expectedBuf);
    return false;
  }

  return timingSafeEqual(inputBuf, expectedBuf);
}

const SESSION_COOKIE_NAME = 'admin_session';

export { SESSION_COOKIE_NAME };
