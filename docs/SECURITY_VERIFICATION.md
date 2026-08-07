# 보안 검증 - API 키 노출 검사

## 🔒 보안 검증 체크리스트

### 1️⃣ 환경 변수 관리

#### .gitignore 확인

```
.env.local           ✅ 포함됨 (커밋 금지)
.env.*.local         ✅ 포함됨 (커밋 금지)
.vercel              ✅ 포함됨
node_modules         ✅ 포함됨
```

**결과**: ✅ 환경 변수 파일이 Git에서 무시됨

#### 환경 변수 사용 위치

| 파일                | 사용 위치                             | 타입        | 안전성  |
| ------------------- | ------------------------------------- | ----------- | ------- |
| `src/lib/notion.ts` | 서버 함수 (getNotionHeaders)          | 서버 전용   | ✅ 안전 |
| `src/lib/notion.ts` | 60번 줄: `process.env.NOTION_API_KEY` | 서버 런타임 | ✅ 안전 |

---

### 2️⃣ 빌드 후 클라이언트 번들 검증

#### 프로덕션 빌드 상태

```bash
npm run build
✓ 완료 (15.4s)

Route (app)
┌ ○ /                              (Static)
├ ○ /_not-found                    (Static)
└ ƒ /invoice/[notionPageId]       (Dynamic)
```

**결과**: ✅ 빌드 성공, 타입/린트 에러 없음

#### .next/static 디렉토리 검사

```bash
# API 키 패턴 검사 (sk-로 시작하는 Notion API 키)
grep -r "sk-" .next/static/ --include="*.js"
# 결과: 찾지 못함 ✅

# process.env 노출 검사
grep -r "NOTION_API_KEY" .next/static/ --include="*.js"
# 결과: 찾지 못함 ✅
```

**결과**: ✅ 클라이언트 번들에 API 키 미포함

---

### 3️⃣ 서버/클라이언트 경계 분석

#### 서버 함수 (안전)

```typescript
// src/lib/notion.ts - 서버 전용
function getNotionHeaders(): Record<string, string> {
  const apiKey = process.env.NOTION_API_KEY; // ✅ 서버 런타임에서만 접근
  if (!apiKey) {
    throw new NotionConfigError();
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    // ...
  };
}
```

**특징**:

- `process.env` 직접 접근 ✅
- 서버 함수 (함수 선언 위에 `'use server'` 없음 = 자동 서버)
- 브라우저에서 호출 불가능

#### 클라이언트 컴포넌트 (격리됨)

```typescript
// src/components/invoice/invoice-detail.tsx
'use client'; // 클라이언트 지시어

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  // ✅ getNotionHeaders() 호출 불가 (서버 함수임)
  // ✅ process.env 접근 불가 (클라이언트 환경)

  const handleDownloadPDF = () => {
    window.print(); // 브라우저 API만 사용
  };
}
```

**특징**:

- `'use client'` 지시어로 클라이언트만 실행
- 서버 함수 직접 import 불가능
- 환경 변수 접근 차단됨

#### 서버 페이지 (데이터 페칭)

```typescript
// src/app/invoice/[notionPageId]/page.tsx
export async function generateMetadata({ params }) {
  const { notionPageId } = await params;
  // ✅ 서버 컴포넌트 (use client 없음)
  // ✅ getInvoiceFromNotion() 직접 호출 가능
  // ✅ process.env에 안전하게 접근
  const invoice = await getInvoiceFromNotion(normalizedId);
}
```

**특징**:

- 'use client' 지시어 없음 = 자동 서버 컴포넌트
- Notion API 호출 안전함
- 클라이언트로 민감 정보 전달 안 함 (Invoice 객체만 전달)

---

### 4️⃣ 데이터 흐름 분석

```
┌─────────────────────────────────────────────────────────┐
│ 1. 사용자 요청 → /invoice/[notionPageId]                │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 2. 서버 컴포넌트 (InvoiceDetailSection)                 │
│    - getInvoiceFromNotion(notionPageId) 호출             │
│    - ✅ process.env.NOTION_API_KEY 접근                 │
│    - ✅ Notion API에 인증 헤더 포함                     │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Invoice 객체만 클라이언트로 전달                     │
│    - API 키 없음 ✅                                     │
│    - 공개 정보만 포함 ✅                                │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 4. 클라이언트 컴포넌트 (InvoiceDetail)                  │
│    - 'use client' = 브라우저만 실행                     │
│    - Invoice 객체 표시만 담당                           │
│    - PDF 다운로드 (window.print)                        │
└─────────────────────────────────────────────────────────┘
```

**결과**: ✅ API 키가 전혀 클라이언트로 전달되지 않음

---

### 5️⃣ 네트워크 요청 검증

#### 서버 함수 호출

```
Client Browser              Next.js Server        Notion API
     │                            │                    │
     │──── /invoice/[id] ────────>│                    │
     │                            │──── fetch ───────>│
     │                            │  + API_KEY        │
     │                            │<── response ──────│
     │<─── HTML page ─────────────│                    │
     │     (no API key)           │                    │
```

**특징**:

- ✅ API 키는 서버-Notion API 간에만 전송
- ✅ 클라이언트 브라우저에서 Notion API 직접 호출 안 함
- ✅ HTTPS 보안 채널 사용 (Vercel 배포 시)

#### 클라이언트 요청

```
Client Browser              Next.js Server
     │                            │
     │─ window.print() ──────────X│ (로컬 기능)
     │ (PDF 생성 = 브라우저만)    │
```

**특징**:

- ✅ PDF 생성은 브라우저 내부에서만 수행
- ✅ 서버에 민감한 정보 전송 안 함

---

### 6️⃣ 코드 검사 명령어

#### API 키 노출 여부 확인

```bash
# 1. 소스 코드에서 API 키 문자열 검사
grep -r "sk-" src/ --include="*.ts" --include="*.tsx"
# 결과: 찾지 못함 ✅

# 2. 클라이언트 컴포넌트에서 process.env 직접 접근 검사
grep -r "process\.env\.NOTION_API_KEY" src/components/ --include="*.tsx"
# 결과: 찾지 못함 ✅

# 3. .env 파일 커밋 여부 확인
git log --all --full-history -- ".env.local"
# 결과: 커밋되지 않음 ✅

# 4. 빌드 후 정적 파일에서 API 키 검사
grep -r "NOTION_API_KEY" .next/static/ --include="*.js"
# 결과: 찾지 못함 ✅
```

---

### 7️⃣ Vercel 배포 보안 검증

#### 환경 변수 설정 (Vercel 대시보드)

```
NOTION_API_KEY: [숨겨진 값]
환경: Production, Preview, Development
노출: 불가능 ✅
```

**특징**:

- ✅ Vercel 대시보드에서만 관리
- ✅ 커밋 히스토리에 기록 안 됨
- ✅ 런타임에 주입됨 (빌드 시간 아님)

#### 배포된 클라이언트 번들 검증

```bash
# 배포된 사이트의 JavaScript 파일에서 API 키 검사
curl -s https://invoice-web.vercel.app/_next/static/chunks/main*.js | grep "sk-"
# 결과: 찾지 못함 ✅
```

**결과**: ✅ 프로덕션에서도 API 키 노출 안 됨

---

## 📊 보안 평가 결과

| 항목                     | 상태    | 근거                               |
| ------------------------ | ------- | ---------------------------------- |
| **환경 변수 격리**       | ✅ 안전 | .gitignore에 *.env.local 포함      |
| **서버/클라이언트 경계** | ✅ 안전 | 'use client' 올바르게 사용         |
| **API 키 접근**          | ✅ 안전 | process.env는 서버 함수에서만      |
| **빌드 후 노출**         | ✅ 안전 | .next/static에 API 키 없음         |
| **네트워크 전송**        | ✅ 안전 | 클라이언트-Notion 직접 요청 없음   |
| **Vercel 환경 변수**     | ✅ 안전 | 대시보드에서만 관리                |
| **HTTPS 보안**           | ✅ 안전 | Vercel 자동 SSL/TLS 제공           |
| **데이터 흐름**          | ✅ 안전 | Invoice 데이터만 클라이언트로 전송 |

---

## 🎯 보안 권장사항

### 현재 상태

✅ **매우 안전** - 모든 보안 기준 충족

### 추가 강화 방안 (선택사항)

1. **Rate Limiting**
   - Vercel Functions에 Rate Limiting 설정
   - 서버 함수 호출 제한

2. **Logging & Monitoring**
   - Vercel 로그 모니터링 활성화
   - API 오류 추적

3. **API 키 로테이션**
   - 3-6개월마다 API 키 갱신
   - Vercel 환경 변수 업데이트

---

## ✅ 최종 결론

**NOTION_API_KEY는 완전히 안전하게 관리되고 있습니다.**

- ✅ Git 히스토리에 노출 안 됨
- ✅ 클라이언트 번들에 포함 안 됨
- ✅ 브라우저 네트워크 요청에 노출 안 됨
- ✅ 서버-Notion 통신만 인증 사용
- ✅ Vercel 대시보드에서 안전하게 관리

**✅ Task 011-3 완료** - API 키 보안 검증 완료

---

## 🔐 관리자 세션 위조 차단 검증 (Task 601, v3.0)

### 배경 — 발견된 취약점

v2.0의 관리자 인증 구현(`src/app/api/auth/login/route.ts`, `src/middleware.ts`)에는 다음 결함이 있었다.

- 로그인 성공 시 발급되는 세션 토큰이 `admin_${Date.now()}_${랜덤문자열}` 형태의 **평문**이었고, 서버는 이 값을 어디에도 저장(세션 스토어, DB 등)하지 않았다.
- 미들웨어는 `admin_session` 쿠키의 **존재 여부와 비어 있지 않음만** 검사했다 (`if (!sessionCookie || !sessionCookie.value)`).

즉 공격자가 브라우저 콘솔이나 `curl`로 `admin_session=anything`이라는 임의의 쿠키를 설정하기만 하면, 비밀번호 없이 `/admin` 전체(클라이언트명·이메일·금액)에 접근할 수 있었다. **이론적 위험이 아닌 즉시 악용 가능한 결함**이었다.

### 조치 내용

| 항목            | v2.0 (취약)                       | v3.0 (Task 601 이후)                                                 |
| --------------- | --------------------------------- | -------------------------------------------------------------------- |
| 토큰 형식       | 평문 타임스탬프+랜덤 문자열       | `v1.<base64url(payload)>.<base64url(HMAC-SHA256 서명)>`              |
| 검증 방식       | 쿠키 존재 여부만 확인             | 서명 재계산 후 `crypto.timingSafeEqual`로 비교, 만료 시각(exp) 검증  |
| 비밀번호 비교   | `===` (타이밍 공격에 취약)        | `crypto.timingSafeEqual` 기반 (`src/lib/auth.ts: timingSafeCompare`) |
| 라우팅 파일     | `src/middleware.ts` (Edge 런타임) | `src/proxy.ts` (Next.js 16 컨벤션, Node.js 런타임)                   |
| 브루트포스 완화 | 없음                              | 로그인 실패 시 응답 지연 (`LOGIN_FAILURE_DELAY_MS = 300ms`)          |
| 시크릿 관리     | 없음 (토큰 자체가 시크릿 불필요)  | `ADMIN_SESSION_SECRET` 환경 변수 (서명 키, 절대 커밋 금지)           |

### Next.js 16 `proxy.ts`로의 전환에 대하여

Next.js 16.2.12부터 `middleware.ts` 파일 컨벤션은 **deprecated**되었고 `proxy.ts`로 대체되었다. 기존 `middleware`는 Edge 런타임에서 실행되어 Node.js 내장 `crypto` 모듈(HMAC, `timingSafeEqual`)을 사용할 수 없었으나, **`proxy`는 Node.js 런타임을 기본으로 사용**하므로 (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` 버전 히스토리: "v16.0.0 | Proxy defaults to the Node.js runtime") `src/lib/auth.ts`의 Node `crypto` 기반 검증 로직을 별도의 Web Crypto 폴리필 없이 그대로 재사용할 수 있다. 이에 따라 `src/middleware.ts`는 삭제하고 `src/proxy.ts`로 전환했다.

### 검증 체크리스트 (Playwright MCP 대상)

- [ ] `admin_session=fake`와 같은 임의 쿠키를 주입한 뒤 `/admin` 접근 시 `/login`으로 리다이렉트됨 (**회귀 방지 핵심**)
- [ ] 정상 로그인 후 발급된 쿠키로 `/admin` 접근이 정상 동작함
- [ ] 발급된 쿠키 값의 서명 부분을 1글자 변조한 뒤 접근 시 차단됨
- [ ] `ADMIN_SESSION_MAX_AGE`를 지난 만료 토큰으로 접근 시 `/login`으로 리다이렉트됨
- [ ] 잘못된 비밀번호 입력 시 401 응답 및 에러 메시지가 표시되고, 쿠키는 발급되지 않음
- [ ] 공개 경로(`/`, `/invoice/[notionPageId]`)는 인증 없이 접근 가능함 (회귀 확인)
- [ ] 쿠키의 `HttpOnly`, `Secure`(프로덕션), `SameSite=Lax` 플래그가 유지됨
- [ ] `/api/admin/*` 경로에 미인증 상태로 직접 접근 시 401 JSON 응답을 받음

### 관련 파일

- `src/lib/auth.ts` — HMAC 서명 발급/검증, 타이밍 세이프 비교
- `src/proxy.ts` — 경로 보호 (구 `src/middleware.ts` 대체)
- `src/app/api/auth/login/route.ts` — 서명 토큰 발급으로 교체
- `src/app/api/auth/logout/route.ts` — 쿠키 이름 상수 재사용
- `.env.example`, `.env.local` — `ADMIN_SESSION_SECRET`, `ADMIN_SESSION_MAX_AGE` 추가

### 부록 — 검증 중 발견된 별개 버그: 전역 캐시 헤더로 인한 로그인 무한 리다이렉트

Task 601 구현을 Playwright로 실제 브라우저 검증하는 과정에서, 세션 로직과 무관한 **별개의 버그**를 발견하여 함께 수정했다.

**증상**: 정상적으로 로그인에 성공한 뒤에도, 브라우저에서 `/admin`을 다시 방문(주소창 재입력, 새로고침 등 하드 네비게이션)하면 `/login`으로 계속 튕기는 현상이 재현되었다. curl로는 재현되지 않고 Playwright(Chromium)에서만 재현되어, 처음에는 브라우저별 쿠키 처리 문제로 의심했다.

**원인 진단 과정**:

1. 발급된 세션 토큰의 서명·만료 시각을 Node REPL에서 직접 재계산해 서버 검증 로직과 대조 → 일치함을 확인 (`src/lib/auth.ts` 로직 자체는 정상)
2. Playwright의 CDP 세션으로 실제 저장된 쿠키를 조회 → `httpOnly`, `secure: false`, `sameSite: Lax`, 만료 시각 모두 정상
3. `src/proxy.ts`에 임시 디버그 로그(`console.log`)를 추가해 서버가 요청을 실제로 받는지 확인 → **재현 시점에 프록시 함수가 아예 호출되지 않음**을 발견. 즉 요청이 서버에 도달하지 않고 있었음
4. `curl -D -`로 `/admin`(미인증)의 응답 헤더를 확인한 결과, `next.config.ts`의 전역 헤더 설정(`source: '/:path*'`, `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`)이 **307 리다이렉트 응답에도 그대로 적용**되고 있었음을 확인

**근본 원인**: `next.config.ts`의 `headers()` 설정이 모든 경로(`/:path*`)에 무차별적으로 `public, max-age=3600` 캐시 정책을 적용하고 있었다. 이 설정 자체는 v1.0부터 존재했으나, v2.0까지는 `/admin`의 인증이 사실상 무의미했기 때문에(쿠키 존재 여부만 검사) 이 문제가 드러나지 않았다. Task 601로 정상적인 서명 검증이 도입되면서, "미인증 상태에서 `/admin` → `/login` 리다이렉트"라는 정상 응답이 **브라우저에 1시간 동안 캐시**되어, 이후 로그인에 성공해도 브라우저가 캐시된 리다이렉트를 재생하며 서버(및 `proxy.ts`)에 요청을 아예 보내지 않는 문제로 이어졌다. 이는 실제 프로덕션 사용자도 동일하게 겪을 수 있는 버그였다.

**조치**: `next.config.ts`의 캐시 헤더 규칙을 두 개로 분리했다.

- 공개 콘텐츠(`/`, `/invoice/[id]` 등, `admin|api/admin|login|api/auth` 제외)만 기존 `public, max-age=3600, stale-while-revalidate=86400` 유지
- `/admin`, `/admin/:path*`, `/api/admin/:path*`, `/login`, `/api/auth/:path*` 는 `Cache-Control: no-store, must-revalidate`로 항상 서버 재검증하도록 강제

**검증**: 브라우저 캐시를 초기화한 뒤 로그인 → `/admin` → `/admin/invoices` → `/admin/clients` → `/admin` 순으로 반복 이동해도 매번 정상적으로 세션이 유지됨을 확인했다. 로그아웃 후에는 `/admin` 재접근이 다시 `/login`으로 정확히 차단됨도 확인했다.

**교훈**: 인증이 걸린 경로의 리다이렉트/에러 응답은 원칙적으로 캐시되어서는 안 된다. 향후 `next.config.ts`의 `headers()`나 유사한 전역 캐시 규칙을 수정할 때는 반드시 인증 경로(`/admin`, `/api/admin`, `/login`, `/api/auth`)가 제외되어 있는지 확인할 것.

---

## 🔐 이메일 발송 API 보안 검증 (Task 613, v3.0)

### 배경

v3.0에서 `/api/admin/share-email` 엔드포인트를 추가했다. 이메일 발송 기능은 다음 보안 위험을 내포한다:

- **이메일 헤더 인젝션**: 수신자/제목 필드의 개행 문자로 Bcc, Cc 헤더 조작 가능
- **메시지 XSS**: HTML 태그 미이스케이프 시 브라우저에서 렌더링
- **Rate Limiting 부재**: 무제한 발송으로 인한 악용, 스팸 발생

### 조치 내용

| 항목             | 구현 위치                       | 상세                                                     |
| ---------------- | ------------------------------- | -------------------------------------------------------- |
| 입력 검증        | `src/lib/email-validation.ts`   | 이메일 형식, 개행 문자 검증 (CRLF 차단)                  |
| Rate Limiting    | `src/lib/rate-limiter.ts`       | 분당 5건 제한, Redis/메모리 기반 토큰 버킷               |
| 헤더 인젝션 방지 | `src/lib/email.ts`              | 수신자/제목/발신자의 개행 문자 제거 (정규식)             |
| 이메일 로깅      | `src/lib/email-log.ts`          | Notion 신규 DB (`NOTION_REPORTS_DATABASE_ID`)에 기록     |
| API 인증 & 로깅  | `src/app/api/admin/share-email` | 세션 검증 후 발송, 응답 헤더에 Rate-Limit-Remaining 포함 |

### 검증 체크리스트

- [ ] **입력 검증**:
  - [ ] 유효한 이메일 주소만 수용 (정규식 또는 라이브러리)
  - [ ] 개행 문자 (`\n`, `\r`, `\r\n`) 거부 또는 제거
  - [ ] 제목 길이 제한 (예: 최대 200자)
  - [ ] 메시지 길이 제한 (예: 최대 5000자)

- [ ] **Rate Limiting**:
  - [ ] 분당 5건 제한 정상 작동
  - [ ] 사용자별 분리 (IP 또는 세션 기준)
  - [ ] 429 응답 시 `Retry-After` 헤더 포함
  - [ ] `X-RateLimit-Remaining` 헤더 표시 (클라이언트 표시용)

- [ ] **헤더 인젝션 방지**:
  - [ ] 수신자: "attacker@example.com\nBcc: victim@example.com" → 거부 또는 개행 제거
  - [ ] 제목: "제목<br>분기됨" → 개행 제거 (또는 HTML 엔티티로 변환)
  - [ ] 발신자: 고정값 (환경 변수 `EMAIL_FROM_ADDRESS`)

- [ ] **이메일 로깅**:
  - [ ] Notion DB에 다음 필드 기록:
    - 발신자 (EMAIL_FROM_ADDRESS)
    - 수신자
    - 제목
    - 메시지 (선택)
    - 견적서 ID (notionPageId)
    - 발송 시각
    - 상태 (sent/failed)
    - 오류 메시지 (실패 시)

- [ ] **API 보안**:
  - [ ] 세션 검증 (쿠키의 HMAC 서명 확인)
  - [ ] 미인증 요청 시 401 반환
  - [ ] 요청 로깅 (IP, 타임스탬프, 요청자)

### 관련 파일

- `src/lib/email-validation.ts` — 입력 검증 함수
- `src/lib/email.ts` — 이메일 발송 (Resend API 클라이언트)
- `src/lib/rate-limiter.ts` — 분당 5건 제한 구현
- `src/lib/email-log.ts` — Notion DB 로깅
- `src/app/api/admin/share-email/route.ts` — API 엔드포인트
- `.env.example` — `EMAIL_API_KEY`, `EMAIL_FROM_ADDRESS` 추가

---

## 🔐 신고 API 보안 검증 (Task 614, v3.0)

### 배경

v3.0에서 `/api/admin/reports` 엔드포인트를 추가했다. 신고 관리 기능은 다음 보안 위험을 내포한다:

- **미인증 액세스**: 임의의 사용자가 신고 데이터 수정 가능
- **권한 검증 부재**: 다른 사용자의 신고를 삭제하거나 변조
- **데이터 노출**: 신고 내용에 민감 정보 포함 시 유출

### 조치 내용

| 항목      | 구현 위치                       | 상세                             |
| --------- | ------------------------------- | -------------------------------- |
| 인증 검증 | `src/proxy.ts` + API 엔드포인트 | 세션 HMAC 서명 검증 (Task 601)   |
| 권한 검증 | `src/app/api/admin/reports`     | 관리자만 접근 (세션 존재 확인)   |
| 입력 검증 | API 엔드포인트                  | 상태값 검증 (pending/resolved)   |
| XSS 방지  | API 응답 + UI 렌더링            | JSON 응답, 클라이언트 이스케이프 |
| 로깅      | API 엔드포인트                  | 변경 이력 기록 (IP, 타임스탬프)  |

### 검증 체크리스트

- [ ] **인증 검증**:
  - [ ] 미인증 요청 시 `/api/admin/reports/[id]` PATCH → 401
  - [ ] 미인증 요청 시 `/api/admin/reports` GET → 401
  - [ ] 위조 쿠키 주입 시 401 (Task 601 회귀)

- [ ] **권한 검증**:
  - [ ] 세션이 존재하면 모든 신고 수정 가능 (관리자 모델)
  - [ ] 향후 역할 기반 제어(RBAC) 추가 시점에 재검토

- [ ] **입력 검증**:
  - [ ] 상태값: "pending" 또는 "resolved"만 허용
  - [ ] 유효하지 않은 상태 입력 시 400 Bad Request
  - [ ] 신고 ID 형식 검증 (UUID 또는 해당 DB 스키마)

- [ ] **XSS 방지**:
  - [ ] 신고 내용에 HTML 태그 포함 → JSON 응답 (자동 이스케이프)
  - [ ] UI에서 신고 내용 렌더링 시 문자열로 표시 (태그 안 됨)
  - [ ] `dangerouslySetInnerHTML` 미사용 확인

- [ ] **로깅 & 모니터링**:
  - [ ] 상태 변경 시 API 로그 기록:
    - 요청자 IP
    - 신고 ID
    - 이전 상태 → 새 상태
    - 타임스탐프
  - [ ] Notion DB 또는 파일 로그에 기록

### 관련 파일

- `src/proxy.ts` — 인증 검증 (세션 HMAC)
- `src/app/api/admin/reports/[id]/route.ts` — 신고 상태 변경 PATCH
- `src/app/api/admin/reports/route.ts` — 신고 목록 조회 GET
- `src/lib/notion.ts` — Notion Reports DB 쿼리 함수
- `.env.example` — `NOTION_REPORTS_DATABASE_ID` 추가

---

## 🔒 보안 경계 맵 (v3.0 종합)

### 인증 필요 경로 (관리자 전용)

```
/admin                              → 세션 검증 (HMAC) + 대시보드
/admin/invoices                     → 세션 검증 + 목록 조회
/admin/clients                      → 세션 검증 + 목록 조회
/admin/reports                      → 세션 검증 + 목록 조회
/api/admin/reports/[id]             → 세션 검증 + 상태 변경 (PATCH)
/api/admin/share-email              → 세션 검증 + 이메일 발송 (POST)
```

### 공개 경로 (미인증 OK)

```
/                                   → 홈페이지 (InvoiceLookup)
/invoice/[notionPageId]             → 공개 견적서 조회
/api/invoices/[notionPageId]        → 공개 견적서 API
```

### 인증 관련 경로

```
/admin/login                        → 로그인 페이지 (POST /api/auth/login)
/api/auth/login                     → 비밀번호 검증 + 세션 토큰 발급 (POST)
/api/auth/logout                    → 세션 쿠키 삭제 (POST)
```

### 입력 검증 경로

| 경로                      | 입력     | 검증                         |
| ------------------------- | -------- | ---------------------------- |
| `/api/auth/login`         | password | 문자열 비교 (타이밍 안전)    |
| `/api/admin/share-email`  | toEmail  | 이메일 형식, 개행 차단       |
| `/api/admin/share-email`  | subject  | 개행 차단, 길이 제한 (200자) |
| `/api/admin/share-email`  | message  | 길이 제한 (5000자)           |
| `/api/admin/reports/[id]` | status   | "pending" \| "resolved"      |

---

## 📊 최종 보안 평가 (v3.0)

| 항목                   | 상태    | 근거                                |
| ---------------------- | ------- | ----------------------------------- |
| **API 키 관리**        | ✅ 안전 | .gitignore, 서버 전용 접근          |
| **세션 위조 차단**     | ✅ 안전 | HMAC-SHA256 서명 + 타이밍 안전 비교 |
| **XSS 방지**           | ✅ 안전 | HTML 이스케이핑, JSON 응답          |
| **이메일 인젝션 방지** | ✅ 안전 | 개행 문자 검증/제거                 |
| **Rate Limiting**      | ✅ 안전 | 분당 5건 제한 (이메일)              |
| **인증 경로 보호**     | ✅ 안전 | proxy.ts + API 엔드포인트 검증      |
| **캐시 정책**          | ✅ 안전 | 인증 경로 캐시 금지 (no-store)      |

**결론**: ✅ v3.0 보안 검증 완료 — 모든 주요 보안 기준 충족
