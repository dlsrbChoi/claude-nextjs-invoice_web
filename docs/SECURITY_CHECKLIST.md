# 보안 검증 체크리스트

## 개요

이 체크리스트는 프로덕션 배포 전 보안 검증 항목을 정리합니다.

## 인증 및 세션 관리

### HTTP-only 쿠키

- [x] 세션 쿠키에 `httpOnly: true` 설정
- [x] 쿠키에 `secure: true` (프로덕션만)
- [x] `sameSite: 'lax'` 설정 (CSRF 방지)
- [x] 최대 유효 시간 설정 (60분)
- [x] 로그아웃 시 쿠키 삭제 (`maxAge: 0`)

**검증 명령어**:

```bash
# 쿠키 확인 (Chrome DevTools)
1. F12 -> Application -> Cookies
2. admin_session 쿠키 확인
3. HttpOnly, Secure, SameSite=Lax 속성 확인
```

### 비밀번호 관리

- [x] 환경 변수 `ADMIN_PASSWORD`로 관리
- [ ] **프로덕션**: 강력한 비밀번호 (12자 이상, 특수문자 포함)
- [ ] **프로덕션**: 해싱 구현 검토 (bcrypt 등)
- [ ] 비밀번호를 코드에 하드코딩하지 않음
- [ ] 비밀번호 변경 기능 (향후)

**개선 안**:

```typescript
// 향후: bcrypt 해싱 추가
import bcrypt from 'bcrypt';

const hashedPassword = process.env.ADMIN_PASSWORD_HASH; // 해시된 비밀번호
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

## API 보안

### 입력 검증

- [x] POST /api/auth/login에서 비밀번호 타입 확인
- [x] Content-Type 검증 (application/json)
- [ ] Rate limiting 구현 (향후)
- [ ] 입력 길이 제한

**현재 구현**:

```typescript
if (!password || typeof password !== 'string') {
  return NextResponse.json({ error: '...' }, { status: 400 });
}
```

### CORS 정책

- [x] 크로스 도메인 요청 필터링 (middleware)
- [ ] CORS 헤더 명시 검토
- [ ] 외부 API 호출 시 검증

### 에러 처리

- [x] 민감한 정보 노출 방지 (일반 에러 메시지)
- [x] 상세 에러 로그 (console.error, 프로덕션 환경변수 )
- [x] 에러 응답에 스택 트레이스 미포함

**현재 구현**:

```typescript
// ✅ 사용자에게 보이는 메시지 (일반적)
{
  error: '서버 오류가 발생했습니다.';
}

// ✅ 서버 로그 (상세)
console.error('로그인 처리 중 오류:', error);
```

## 환경 변수 관리

### 민감한 정보 보호

- [x] `.env.local`은 `.gitignore`에 등록됨
- [x] `.env.example`에는 더미 값만 포함
- [ ] **프로덕션**: 환경 변수를 배포 플랫폼 (Vercel, AWS 등)에서 설정
- [ ] 로컬에서 테스트할 때만 `.env.local` 사용

### 필수 환경 변수

- [x] `NOTION_API_KEY`: Notion API 인증
- [x] `NOTION_DATABASE_ID`: 데이터베이스 ID
- [x] `ADMIN_PASSWORD`: 관리자 비밀번호
- [x] `NEXT_PUBLIC_APP_URL`: 공개 URL (XSS 방지용)

**검증**:

```bash
# 배포 전 모든 필수 변수 설정 확인
echo "NOTION_API_KEY: ${NOTION_API_KEY:?필수}"
echo "NOTION_DATABASE_ID: ${NOTION_DATABASE_ID:?필수}"
echo "ADMIN_PASSWORD: ${ADMIN_PASSWORD:?필수}"
```

## XSS (Cross-Site Scripting) 방지

### 현재 구현

- [x] React의 자동 이스케이프 (JSX)
- [x] `dangerouslySetInnerHTML` 미사용
- [x] 사용자 입력 데이터 검증

### 검토 필요

- [ ] 토스트 메시지 (sonner) XSS 검증
- [ ] 링크 복사 기능 (URL 검증)

**링크 복사 보안**:

```typescript
// ✅ 안전: 현재 도메인 기반
const url = `${window.location.origin}/invoice/${notionPageId}`;

// ❌ 위험: 사용자 입력 기반
const url = userProvidedUrl; // 검증 필수!
```

## CSRF (Cross-Site Request Forgery) 방지

### 현재 구현

- [x] `sameSite='lax'` 쿠키 설정
- [x] POST 요청에 쿠키 포함 (SameSite 자동 검증)
- [ ] CSRF 토큰 구현 (선택사항, SameSite로 충분)

**SameSite 동작**:

```
요청 출처 | SameSite=Lax | 동작
-------|-------------|-----
같은 도메인 | 포함 | ✅ 쿠키 전송
외부 도메인 | 제외 | 🛑 쿠키 미전송
외부 <form> POST | 제외 | 🛑 안전
```

## SQL Injection 방지

### 현재 상태

- [x] **적용 불필요**: 직접 데이터베이스 사용 안 함
- [x] Notion API만 사용 (자동 검증)

## 정보 공개 최소화

### Public 변수

- [x] `NEXT_PUBLIC_APP_URL`: 공개 필요 (견적서 URL 생성)
- [ ] 기타 `NEXT_PUBLIC_*` 변수 검토

### 민감한 정보

- [x] API 키는 환경 변수 (서버에서만)
- [x] 데이터베이스 ID는 필요시에만 노출
- [x] 에러 메시지에서 상세 정보 제외

## 라이브러리 보안

### 의존성 검사

```bash
# NPM 보안 감시
npm audit

# 결과 예상
# npm notice found 0 vulnerabilities

# 취약점 자동 수정
npm audit fix
```

### 정기 업데이트

```bash
# 안전한 업데이트 검사
npm outdated

# 마이너 버전 업데이트
npm update
```

## 서버 헤더 보안

### 현재 설정 (Next.js 기본값)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

### 강화 권장 (프로덕션)

```typescript
// next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "default-src 'self'" },
        ],
      },
    ];
  },
};
```

## 데이터 암호화

### 전송 중 암호화 (In-Transit)

- [x] HTTPS 강제 (프로덕션)
  ```typescript
  secure: process.env.NODE_ENV === 'production';
  ```

### 저장된 데이터 암호화 (At-Rest)

- [ ] 적용 불필요: 세션은 메모리에만 저장 (쿠키 기반)
- [ ] Notion 데이터는 Notion 서버에서 암호화됨

## 로깅 및 모니터링

### 보안 로그

- [x] 로그인 실패 기록
- [x] 에러 로그 콘솔에 출력
- [ ] **프로덕션**: 중앙 집중식 로깅 (Sentry 등)

**현재 로그**:

```typescript
console.error('로그인 처리 중 오류:', error);
console.warn('Notion 목록 조회 부분 성공: ...');
```

### 접근 제어 로그

- [x] 미인증 접근 시도 리다이렉트 (middleware)
- [ ] 접근 시도 상세 로깅 (향후)

## 배포 보안

### 프로덕션 체크리스트

- [ ] 모든 환경 변수 설정 확인
- [ ] `NODE_ENV=production` 설정
- [ ] HTTPS 활성화
- [ ] 보안 헤더 설정
- [ ] 에러 페이지 커스터마이징 (민감정보 제거)
- [ ] 로깅 및 모니터링 설정
- [ ] 정기 보안 감사 일정

### Vercel 배포 (권장)

```bash
# 1. Vercel에 로그인
vercel login

# 2. 환경 변수 설정 (Vercel 대시보드)
Settings > Environment Variables
  - NOTION_API_KEY
  - NOTION_DATABASE_ID
  - ADMIN_PASSWORD

# 3. 배포
vercel --prod
```

### 자체 서버 배포

```bash
# 1. 환경 변수 설정 (.env)
NOTION_API_KEY=xxx
NOTION_DATABASE_ID=xxx
ADMIN_PASSWORD=xxx
NODE_ENV=production

# 2. 빌드
npm run build

# 3. HTTPS 설정 (Let's Encrypt + Nginx/Apache)

# 4. 실행
NODE_ENV=production npm run start

# 5. PM2로 관리 (선택사항)
pm2 start "npm run start" --name invoice-web
```

## 정기 보안 감사

### 월간 검사

- [ ] `npm audit` 실행
- [ ] 의존성 업데이트 확인
- [ ] 에러 로그 검토

### 분기별 검사

- [ ] Lighthouse 감사
- [ ] 보안 헤더 검증
- [ ] 로그인 플로우 테스트

### 연간 검사

- [ ] 보안 전문가 코드 리뷰
- [ ] 침투 테스트 (선택사항)
- [ ] 컴플라이언스 검증

## 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [HTTP Security Headers](https://securityheaders.com/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

## 보안 검증 기록

### 초기 검증 (Task 513)

- [x] 인증 시스템 기본 보안 확인
- [x] HTTP-only 쿠키 설정 확인
- [x] 환경 변수 관리 확인
- [x] XSS 방지 확인
- [ ] 프로덕션 배포 전 최종 검증 필요

**다음 단계**: Vercel 배포 후 Security Headers 검증
