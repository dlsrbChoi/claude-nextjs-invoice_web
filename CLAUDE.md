# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소의 코드를 작업할 때 참고할 지침을 제공합니다.

## 프로젝트 개요

노션 기반 견적서 관리 시스템 v3.0. Next.js 16, React 19, TypeScript, TailwindCSS v4, shadcn/ui (base-ui 기반)를 활용한 프로덕션 레디 프로젝트입니다.

### 핵심 기능

**공개 사용자:**

- 홈페이지에서 Notion 견적서 페이지 ID 또는 URL 입력
- 견적서 상세 정보 조회
- PDF 다운로드 및 링크 공유
- **신고 기능** — 부적절한 견적서를 공개적으로 신고

**관리자:**

- 로그인/로그아웃 (쿠키 기반 인증)
- **대시보드** — 통계(견적서 수, 상태별 건수, 총액), 클라이언트 요약, 최근 활동
- **견적서 목록** 페이지네이션 (Notion 커서 기반, 이전/다음 지원)
- **클라이언트 목록** — clientName 기준 집계
- **신고 관리** — 신고 목록, 상태 변경(pending→reviewing→resolved/dismissed)
- **이메일 공유** — 선택된 견적서를 수신자에게 발송

**기술적 구현:**

- Notion API 연동으로 데이터베이스 기반 견적서/신고 관리
- 서버 사이드 렌더링 + 클라이언트 상호작용 분리
- 세션/쿠키 기반 인증 (보안: HttpOnly, Secure, SameSite)
- 반응형 레이아웃 (라이트/다크 모드)

### 아키텍처 주요 특징

**앱 라우터 기반 구조** (`src/app/`)

- Next.js 16 App Router를 사용하여 폴더 기반 라우팅 구현
- **공개 라우트** (인증 불필요):
  - `/` (홈페이지) - 견적서 ID 입력
  - `/invoice/[notionPageId]` (동적 라우트) - 견적서 상세 조회
  - `/login` - 관리자 로그인
- **관리자 라우트** (쿠키 기반 인증 필수):
  - `/admin` (대시보드) - 통계, 클라이언트 요약, 최근 활동
  - `/admin/invoices` - 견적서 목록 (페이지네이션)
  - `/admin/clients` - 클라이언트 요약
  - `/admin/reports` - 신고 관리
- **API 라우트**:
  - `POST /api/auth/login` - 로그인 (쿠키 발급)
  - `POST /api/auth/logout` - 로그아웃
  - `POST /api/admin/share-email` - 이메일 발송 (관리자 전용)
  - `PATCH /api/admin/reports/[id]` - 신고 상태 변경 (관리자 전용)
  - `POST /api/public/report` - 신고 접수 (공개)
- 특수 파일:
  - `error.tsx` (에러 경계) - 전역 에러 처리
  - `not-found.tsx` (404 페이지) - 페이지 미존재 처리
  - `layout.tsx` (루트 레이아웃) - ThemeProvider, 헤더, 푸터 등 공통 레이아웃

**컴포넌트 계층** (`src/components/`)

- **UI 컴포넌트** (`src/components/ui/`): shadcn/ui 기본 컴포넌트 (Button, Card, Input, Dialog, Badge, Separator 등)
  - `@base-ui/react` 기본 컴포넌트를 래핑해 shadcn 스타일 적용
  - `class-variance-authority` (CVA)로 변형/크기 패턴 구현
  - `cn()` 유틸리티 (`src/lib/utils.ts`)로 클래스 병합
- **레이아웃 컴포넌트** (`src/components/layout/`): 헤더, 푸터, 컨테이너, 테마 토글, **관리자 사이드바**
- **패턴 컴포넌트** (`src/components/patterns/`): PageHeader, EmptyState, Pagination
- **견적서 컴포넌트** (`src/components/invoice/`):
  - `InvoiceLookup`: Notion 페이지 ID 입력 폼
  - `InvoiceDetail`: 견적서 상세 정보 표시
  - **`ReportDialog`**: 공개 신고 폼 (모달)
  - `InvoiceListTable`: 목록 테이블 (관리자)
  - `EmailShareDialog`: 이메일 발송 폼 (관리자)
  - `ClientListTable`: 클라이언트 요약 테이블 (관리자)
- **관리자 컴포넌트** (`src/components/admin/`):
  - `ReportsPanel`: 신고 목록 및 상태 변경 UI

**핵심 라이브러리** (`src/lib/`)

- `notion.ts`: Notion API 클라이언트
  - `getInvoiceFromNotion()`: 단일 견적서 조회
  - `getInvoiceListFromNotion()`: 견적서 목록 (페이지네이션, 커서 기반)
  - `getReportListFromNotion()`: 신고 목록 (동일 패턴)
  - `normalizeNotionPageId()`: Notion 페이지 ID 정규화
- `notion-parser.ts`: Notion API 응답 파싱
  - `parseInvoiceFromNotionPage()`: 페이지 properties → Invoice 타입
  - `parseReportFromNotionPage()`: 신고 데이터 파싱
- `types.ts`: TypeScript 타입 정의 (Invoice, Report, DashboardStats, PaginationState 등)
- `auth.ts`: 세션 관리 (쿠키 읽기/쓰기, ADMIN_PASSWORD 검증)
- `email.ts`: 이메일 발송 (Resend API)
- `dashboard.ts`: 대시보드 통계 집계 (N+1 쿼리 회피)
- `format.ts`: 날짜 및 통화 포맷팅
- `utils.ts`: `cn()` 클래스 병합 유틸리티
- `rate-limiter.ts`: 속도 제한 (신고 API)

**스타일링**

- `src/app/globals.css`: TailwindCSS v4 + oklch 색상 변수 정의
- 라이트/다크 모드를 `:root` 및 `.dark` 선택자로 분리
- `next-themes`로 테마 전환 로직 구현

### Next.js 16 주요 변경사항

⚠️ **중요**: 이 프로젝트의 Next.js 16은 학습 데이터 시점과 다를 수 있습니다. 확신이 없는 API나 패턴을 사용할 때는 코드 작성 전 `node_modules/next/dist/docs/` 폴더의 관련 가이드를 먼저 확인하세요.

- **동적 라우트 params는 Promise**: `params: Promise<{notionPageId: string}>`로 선언되며, 반드시 `await params`로 처리해야 함
- **generateStaticParams**: 동적 라우트를 정적 생성하려면 필수 (현재는 동적 라우트이므로 필요시 추가)

## 환경 설정

`.env.local` 파일에 다음을 설정하세요:

```env
# Notion API
NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_ID=your_invoices_database_id_here
NOTION_REPORTS_DATABASE_ID=your_reports_database_id_here

# 관리자 인증
ADMIN_PASSWORD=your_secure_password_here

# 이메일 발송
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM_ADDRESS=noreply@yourdomain.com

# 세션 보안
SESSION_SECRET=your_secure_session_secret_here
```

**Notion API 키**: [Notion Integration](https://www.notion.so/my-integrations)에서 생성
**Resend API 키**: [Resend Console](https://resend.com)에서 생성
**데이터베이스 ID**: Notion에서 데이터베이스 URL의 32자 16진수 부분

## 자주 사용하는 명령어

### 개발

```bash
# 개발 서버 실행 (localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드된 앱 실행 (로컬에서 프로덕션 모드 테스트)
npm run start
```

### 코드 품질 및 포맷팅

```bash
# ESLint 린트 검사
npm run lint

# ESLint 자동 수정
npm run lint:fix

# Prettier 포맷팅 실행
npm run format

# Prettier 포맷 검사 (수정 없음)
npm run format:check

# TypeScript 타입 검사
npm run typecheck

# 전체 검사 실행 (lint + format:check + typecheck) - 커밋/푸시 전 필수
npm run check-all
```

### Git Hooks (자동 실행)

- **pre-commit**: `npm run format && npm run lint:fix` — 커밋 전에 자동 포맷팅 및 린트 수정
- **pre-push**: `npm run check-all` — 푸시 전에 전체 검사 실행

## 주요 의존성

### 프로덕션

- **프레임워크**: Next.js 16, React 19, TypeScript 5
- **스타일**: TailwindCSS v4, oklch 색상 시스템
- **UI**: shadcn/ui (base-nova), @base-ui/react (헤드리스 컴포넌트 기반)
- **테마**: next-themes (라이트/다크/시스템 모드)
- **유틸리티**:
  - `class-variance-authority`: 컴포넌트 변형 정의
  - `clsx` + `tailwind-merge`: 클래스 병합 (조건부/동적 클래스 충돌 해결)
  - `lucide-react`: SVG 아이콘 라이브러리
  - `sonner`: 토스트 알림

### 개발

- **린팅**: ESLint 9, eslint-config-next, eslint-config-prettier, eslint-plugin-prettier
- **포맷팅**: Prettier 3.9.6
- **Git Hooks**: Husky 9.1.7
- **타입 체크**: TypeScript 5 (strict mode)

## 파일 경로 별칭

`tsconfig.json`에서 `@/*` → `./src/*`로 설정:

```tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getInvoiceFromNotion } from '@/lib/notion';
```

## 페이지 구조 패턴

### 홈페이지 (견적서 조회)

```tsx
// src/app/page.tsx
- PageHeader로 제목 표시
- Container로 컨텐츠 감싸기
- InvoiceLookup 컴포넌트로 입력 폼 표시
```

### 동적 라우트 (견적서 상세)

```tsx
// src/app/invoice/[notionPageId]/page.tsx
export async function generateMetadata({ params }: InvoicePageProps): Promise<Metadata> {
  const { notionPageId } = await params;
  // 메타데이터 설정
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { notionPageId } = await params; // ⚠️ 반드시 await!
  // Notion API 호출
  // 상세 정보 표시
}
```

## Notion API 연동

### 페이지 ID 형식

- 32자 16진수: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- 하이픈 포함: `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`
- 모두 지원됨 (정규화됨)

### 데이터 파싱

현재 구현은 기본 구조를 제공합니다. 실제 Notion 데이터베이스 구조에 맞게 `src/lib/notion.ts`의 다음 함수들을 수정해야 합니다:

- `parseInvoiceFromNotionPage()`: 페이지 properties 파싱
- `parseInvoiceItems()`: 항목 데이터 추출 (테이블 블록 등)

## 스타일링 규칙

- **클래스 병합**: `cn()` 함수 사용하여 동적 클래스 충돌 해결
- **색상 변수**: `src/app/globals.css`의 oklch 변수 참조
- **반응형**: TailwindCSS 브레이크포인트 (`md:`, `lg:` 등)
- **다크모드**: `dark:` 접두사로 자동 처리 (next-themes 활용)

## 개발 워크플로우

1. **새 페이지**: `src/app/[route]/page.tsx` 생성 (자동 라우팅)
2. **새 UI 컴포넌트**: `src/components/ui/` 추가
   - shadcn CLI로 추가 시 `components.json` 설정(style: `base-nova`, baseColor: `neutral`, iconLibrary: `lucide`)에 따라 파일이 생성됨
3. **견적서 관련 컴포넌트**: `src/components/invoice/` 추가
4. **클라이언트 로직**: `'use client'` 지시어로 컴포넌트 마크 (useState, 이벤트 핸들러 등)
5. **Notion API 연동**: `src/lib/notion.ts` 함수 활용
6. **타입 안전**: TypeScript strict mode 활성화 — 컴포넌트 props, API 응답 등에 타입 명시

## 검증 및 테스트

### 작업 완료 체크리스트

작업 완료 후 다음 명령어를 반드시 실행하세요:

```bash
# 1. 전체 검사 실행 (린트 + 포맷 검사 + 타입 검사)
npm run check-all

# 2. 프로덕션 빌드 검증
npm run build
```

✅ 두 명령어 모두 성공해야 작업이 완료됩니다.

### 자동화된 검사

- **TypeScript**: `npm run typecheck`로 타입 검사 (strict mode)
- **ESLint**: `npm run lint`로 코드 품질 검사
- **Prettier**: `npm run format:check`로 코드 포맷팅 검사
- **전체 검사**: `npm run check-all`로 모든 검사 한 번에 실행

### 수동 테스트 (E2E)

**공개 사용자 흐름:**

1. 홈페이지에서 Notion 페이지 ID 입력 → 견적서 상세 조회
2. PDF 다운로드 / 링크 복사
3. "신고하기" 버튼 → 신고 다이얼로그 → 이메일/사유 입력 → 제출
4. 토스트 알림 확인

**관리자 흐름:**

1. `/login` 접속 → ADMIN_PASSWORD 입력 → 로그인
2. `/admin` 대시보드 → 통계/클라이언트/활동 표시 확인
3. `/admin/invoices` → 목록 조회 → 페이지네이션 (다음/이전)
4. `/admin/reports` → 신고 목록 → 상태 변경 → Notion 업데이트 확인
5. 견적서 상세 → "링크 복사" → "이메일 공유" → 수신 확인
6. `/api/auth/logout` → 세션 제거 확인

### 주의사항

- **자동화된 테스트 없음**: jest/vitest 미설정, `*.test.ts` 파일 없음
- **모든 검증은 수동**: 브라우저 테스트, 타입 체크, ESLint, Prettier
- **Git Hooks 자동 실행**: `npm run check-all` 성공 후 커밋 가능
- **데이터베이스 필드명**: `src/lib/notion-parser.ts`에서 Notion 속성명 정의 (영문만 사용)
- **에러 처리**: 모든 Notion API 호출은 `InvoiceError`/`ReportError` 예외 발생 가능 — 라우트에서 처리 필수

## 주요 설계 결정

### 페이지네이션 (커서 기반)

Notion API는 **뒤로 가기 커서를 제공하지 않습니다**. 따라서 "이전" 버튼 구현은:

- 방문한 모든 커서를 스택(`prevCursors`)에 누적
- URL 쿼리 파라미터 또는 상태에 저장
- "이전" 클릭 시 스택에서 꺼내서 재조회

### 클라이언트 요약 (집계 방식)

전용 클라이언트 DB를 생성하지 않음. 견적서 목록에서 `clientName` 기준으로:

- 건수 합산
- 금액 합산
- 최근 거래일 추출

### 신고 접수 (공개 + 속도 제한)

- `/api/public/report`로 공개 신고 수락
- 이메일 기반 속도 제한 (5분당 1회)
- Notion `Reports` DB에 저장 (관리자 검토용)

### 이메일 발송 (Resend)

- 관리자만 발송 가능
- 서버 사이드 검증 (클라이언트 검증 신뢰 X)
- Resend API 활용 (Vercel 서버리스 환경 최적화)

### 인증 (쿠키 기반)

- 단순 비밀번호 인증 (JWT X, 단순 쿠키)
- HttpOnly + Secure + SameSite=Strict 플래그
- 로그인/로그아웃 라우트만 서버 사이드 (middleware 미사용)

## 현재 범위 (Phase 3 완료)

- ✅ 공개 견적서 조회 및 PDF 다운로드
- ✅ 공개 신고 접수 + 관리자 신고 관리
- ✅ 관리자 대시보드 (통계, 클라이언트, 활동)
- ✅ 견적서/클라이언트 목록 (페이지네이션)
- ✅ 이메일 공유

## 향후 개선사항 (Phase 4+)

- 자동화된 테스트 스위트 (Jest/Vitest)
- 고급 필터링 및 검색
- 견적서 템플릿 관리
- 결제 연동
- 버전 관리 및 히스토리
- 다국어 지원
