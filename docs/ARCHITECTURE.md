# 🏗️ 프로젝트 아키텍처

invoice-web 프로젝트의 전체 아키텍처, 데이터 흐름, 그리고 컴포넌트 구조를 설명합니다.

---

## 📐 시스템 아키텍처

### 전체 흐름도

```
┌─────────────────────────────────────────────────────────────────┐
│                     Notion Workspace                             │
│  ┌──────────────────┐        ┌──────────────────────────────┐   │
│  │  Invoices DB     │        │  InvoiceItems DB             │   │
│  ├──────────────────┤        ├──────────────────────────────┤   │
│  │ • invoice_number │        │ • description                │   │
│  │ • client_name    │        │ • quantity                   │   │
│  │ • issue_date     │◄─────►│ • unit_price                 │   │
│  │ • items (Rel)    │        │ • amount (Formula)           │   │
│  │ • status         │        │ • invoice_id (Rel)           │   │
│  │ • total_amount   │        └──────────────────────────────┘   │
│  └────────┬──────────┘                                           │
└───────────┼──────────────────────────────────────────────────────┘
            │
            │ Notion API (REST)
            │ POST /v1/pages/{pageId}
            │
┌───────────▼──────────────────────────────────────────────────────┐
│                   Next.js Application (SSR)                      │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  src/lib/                                               │    │
│  │  ├─ notion.ts (API 클라이언트)                         │    │
│  │  │   ├─ getInvoiceFromNotion()                        │    │
│  │  │   ├─ fetchNotionPage()                            │    │
│  │  │   ├─ parseInvoiceFromNotionPage()                │    │
│  │  │   └─ parseInvoiceItems()                         │    │
│  │  ├─ types.ts (TypeScript 인터페이스)                  │    │
│  │  │   ├─ Invoice                                      │    │
│  │  │   ├─ InvoiceItem                                 │    │
│  │  │   ├─ NotionPageBlock                            │    │
│  │  │   └─ NotionDatabase                             │    │
│  │  ├─ format.ts (포매팅 유틸)                           │    │
│  │  │   ├─ formatDate()                               │    │
│  │  │   ├─ formatCurrency()                           │    │
│  │  │   └─ formatNumber()                             │    │
│  │  ├─ utils.ts (클래스 유틸)                            │    │
│  │  │   └─ cn() (Tailwind 클래스 병합)                 │    │
│  │  ├─ mock-data.ts (더미 데이터)                        │    │
│  │  │   └─ mockInvoices[] (Task 004)                   │    │
│  │  └─ constants.ts (향후 추가 예정)                     │    │
│  │      ├─ NOTION_PROPERTY_NAMES                       │    │
│  │      └─ INVOICE_STATUSES                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  src/app/ (App Router)                                 │    │
│  │  ├─ layout.tsx (루트 레이아웃)                         │    │
│  │  │   ├─ ThemeProvider                               │    │
│  │  │   ├─ Header                                      │    │
│  │  │   ├─ Footer                                      │    │
│  │  │   └─ 동적 콘텐츠                                 │    │
│  │  ├─ page.tsx (홈페이지, /)                            │    │
│  │  │   └─ InvoiceLookup (폼)                         │    │
│  │  ├─ error.tsx (에러 경계)                            │    │
│  │  ├─ not-found.tsx (404)                             │    │
│  │  ├─ loading.tsx (글로벌 로딩)                        │    │
│  │  └─ invoice/[notionPageId]/                         │    │
│  │      ├─ page.tsx (견적서 상세)                      │    │
│  │      ├─ loading.tsx (로딩 UI)                       │    │
│  │      ├─ not-found.tsx (404)                         │    │
│  │      └─ error.tsx (에러 처리)                       │    │
│  │          (Task 008 예정)                           │    │
│  │                                                     │    │
│  │  api/ (API Routes)                                │    │
│  │  └─ generate-pdf/ (Task 007 예정)                │    │
│  │      └─ route.ts (PDF 생성)                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  src/components/                                        │    │
│  │  ├─ ui/ (shadcn/ui + TailwindCSS)                     │    │
│  │  │   ├─ button.tsx (CVA 변형)                        │    │
│  │  │   ├─ card.tsx                                    │    │
│  │  │   ├─ input.tsx                                   │    │
│  │  │   ├─ badge.tsx                                   │    │
│  │  │   ├─ skeleton.tsx                                │    │
│  │  │   ├─ dialog.tsx                                  │    │
│  │  │   ├─ separator.tsx                               │    │
│  │  │   ├─ alert.tsx                                   │    │
│  │  │   ├─ sonner.tsx (토스트)                         │    │
│  │  │   └─ ... 기타 UI 컴포넌트                        │    │
│  │  │                                                  │    │
│  │  ├─ layout/                                        │    │
│  │  │   ├─ header.tsx                                 │    │
│  │  │   ├─ footer.tsx                                 │    │
│  │  │   ├─ container.tsx                              │    │
│  │  │   ├─ mobile-nav.tsx                             │    │
│  │  │   ├─ theme-toggle.tsx                           │    │
│  │  │   └─ theme-provider.tsx                         │    │
│  │  │                                                  │    │
│  │  ├─ patterns/                                      │    │
│  │  │   ├─ page-header.tsx                            │    │
│  │  │   ├─ empty-state.tsx                            │    │
│  │  │   └─ ... 재사용 패턴                            │    │
│  │  │                                                  │    │
│  │  └─ invoice/                                       │    │
│  │      ├─ invoice-detail.tsx (견적서 본문)           │    │
│  │      ├─ invoice-lookup.tsx (조회 폼)               │    │
│  │      ├─ invoice-pdf.tsx (Task 007 예정)            │    │
│  │      └─ invoice-table.tsx (항목 테이블)            │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
            │
            │ HTTP Response (HTML + JSON)
            │
┌───────────▼──────────────────────────────────────────────────────┐
│                  클라이언트 브라우저                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 사용자 상호작용                                          │   │
│  │ • 홈 페이지 접속 (InvoiceLookup 폼)                    │   │
│  │ • Notion ID 입력 → /invoice/[id]로 라우팅             │   │
│  │ • 견적서 상세 페이지 표시                              │   │
│  │ • PDF 다운로드 클릭 → 파일 저장                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔄 데이터 흐름

### 1. 견적서 조회 플로우

```
사용자 입력 (페이지 ID)
  ↓
normalizeNotionPageId() → 32자 16진수 변환
  ↓
InvoiceLookup 폼 제출
  ↓
/invoice/[notionPageId]로 라우팅
  ↓
getInvoiceFromNotion(pageId) 호출
  ↓
┌─────────────────────────────────────────┐
│ 더미 데이터 확인 (Task 004)             │
│ → getMockInvoice() 반환 (개발 단계)    │
└─────────────────────────────────────────┘
  ↓ (Task 006에서 실제 API로 변경)
┌─────────────────────────────────────────┐
│ Notion API 호출                         │
│ 1. fetchNotionPage(pageId)             │
│ 2. fetchNotionPageBlocks(pageId)       │
│ 3. parseInvoiceFromNotionPage()        │
│ 4. parseInvoiceItems()                 │
└─────────────────────────────────────────┘
  ↓
Invoice 객체 반환
  ↓
InvoiceDetail 컴포넌트로 렌더링
  ↓
클라이언트 브라우저에 HTML 표시
```

### 2. 데이터 변환 흐름

```
Notion Properties (Raw JSON)
{
  "properties": {
    "title": {
      "type": "title",
      "title": [{ "plain_text": "웹사이트 리디자인" }]
    },
    "invoice_number": {
      "type": "rich_text",
      "rich_text": [{ "plain_text": "INV-2026-001" }]
    },
    "client_name": {
      "type": "rich_text",
      "rich_text": [{ "plain_text": "ABC 주식회사" }]
    },
    "issue_date": {
      "type": "date",
      "date": { "start": "2026-08-01" }
    },
    ...
  }
}
  ↓
parseInvoiceFromNotionPage() 파싱
  ↓
extractTextProperty(), extractDateProperty(), etc.
  ↓
TypeScript Invoice 객체
{
  id: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  title: "웹사이트 리디자인",
  invoiceNumber: "INV-2026-001",
  clientName: "ABC 주식회사",
  issueDate: "2026-08-01",
  totalAmount: 2500000,
  ...
}
  ↓
UI 컴포넌트 렌더링
  ↓
formatCurrency(2500000, 'KRW') → "₩2,500,000"
formatDate("2026-08-01") → "8월 1, 2026"
  ↓
최종 HTML 렌더링
```

---

## 📦 컴포넌트 계층 구조

### 서버 컴포넌트 vs 클라이언트 컴포넌트

```
src/app/
├─ page.tsx (Server Component)
│  └─ InvoiceLookup (Client Component - 'use client')
│     ├─ Input (UI - Server)
│     ├─ Button (UI - Server)
│     └─ form 로직 (useRouter, useState)
│
└─ invoice/[notionPageId]/
   └─ page.tsx (Server Component)
      ├─ PageHeader (Server Component)
      ├─ Container (Server Component)
      └─ InvoiceDetail (Client Component - 'use client')
         ├─ Card (UI - Server)
         ├─ Badge (UI - Server)
         ├─ Table (UI - Server)
         ├─ Button (UI - Server)
         └─ 이벤트 핸들러 (onClick, etc.)
```

**원칙:**

- 기본: **Server Component** (데이터 페칭, SSR)
- 필요시: **Client Component** (`'use client'` 지시어)
  - 상태 관리 (useState, useReducer)
  - 이벤트 핸들러 (onClick, onChange)
  - 훅 사용 (useEffect, useContext)

---

## 🎨 스타일링 아키텍처

### TailwindCSS v4 + oklch 색상 시스템

```
src/app/globals.css
├─ oklch 색상 변수 (:root, .dark)
│  ├─ --primary-lightness
│  ├─ --primary-chroma
│  ├─ --primary-hue
│  └─ ... 기타 색상
│
└─ next-themes 테마 전환

src/lib/utils.ts
└─ cn() 함수
   ├─ clsx() - 조건부 클래스
   └─ tailwind-merge - 클래스 충돌 제거

src/components/ui/*.tsx
├─ class-variance-authority (CVA)
│  └─ variant, size 변형 정의
└─ cn() 함수로 최종 클래스 병합
```

### 색상 변수 사용 예

```css
/* globals.css */
:root {
  --primary-lightness: 0.5;
  --primary-chroma: 0.3;
  --primary-hue: 250;
  --color-primary: oklch(var(--primary-lightness) var(--primary-chroma) var(--primary-hue));
}

.dark {
  --primary-lightness: 0.6;
  --primary-chroma: 0.3;
  --primary-hue: 250;
}
```

```typescript
// components/ui/button.tsx
const buttonVariants = cva('inline-flex items-center justify-center', {
  variants: {
    variant: {
      default: 'bg-primary text-white hover:bg-primary/90 dark:bg-primary/80',
      outline: 'border border-input bg-white dark:bg-slate-950',
    },
  },
});
```

---

## 🔐 보안 아키텍처

### 환경 변수 관리

```
.env.local (로컬 개발)
├─ NOTION_API_KEY (서버 사이드만 접근)
│  └─ process.env.NOTION_API_KEY
│
└─ NEXT_PUBLIC_APP_URL (선택사항)
   └─ process.env.NEXT_PUBLIC_APP_URL

.env.production (배포)
├─ Vercel 환경 변수 설정
└─ NOTION_API_KEY (안전하게 저장)
```

**보안 원칙:**

- ✅ API 키는 서버 사이드에서만 사용
- ❌ 클라이언트 번들에 API 키 포함 금지
- ✅ 모든 Notion API 호출은 백엔드에서 처리

### 에러 메시지 마스킹

```typescript
// ❌ 잘못된 방법 - 민감 정보 노출
console.error('Notion API Error:', error.message); // "401: Unauthorized - Invalid API Key"

// ✅ 올바른 방법 - 마스킹
console.error('Notion API Error: 인증 실패');
return { error: '견적서 조회에 실패했습니다. 잠시 후 다시 시도해주세요.' };
```

---

## 📊 타입 안전성

### TypeScript 인터페이스 계층

```
src/lib/types.ts
├─ Invoice (견적서)
│  ├─ id: string
│  ├─ notionPageId: string
│  ├─ title: string
│  ├─ clientName: string
│  ├─ issueDate: string
│  ├─ totalAmount: number
│  ├─ items: InvoiceItem[]
│  └─ status: 'draft' | 'sent' | 'viewed' | 'paid'
│
├─ InvoiceItem (항목)
│  ├─ id: string
│  ├─ name: string
│  ├─ quantity: number
│  ├─ unitPrice: number
│  └─ description?: string
│
├─ NotionPageBlock (Notion 블록)
│  ├─ id: string
│  ├─ type: string
│  ├─ has_children: boolean
│  └─ [key: string]: any
│
└─ NotionDatabase (Notion 데이터베이스)
   ├─ id: string
   ├─ title: NotionRichText[]
   ├─ properties: Record<string, any>
   └─ ...
```

**strict mode 활성화**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

---

## 🚀 배포 아키텍처

### Vercel 배포 구조

```
GitHub Repository
  ↓ (push to main)
Vercel CI/CD
  ├─ 빌드 단계
  │  ├─ npm install
  │  ├─ npm run build (npm run lint)
  │  └─ 번들 최적화
  │
  ├─ 환경 변수 설정
  │  └─ NOTION_API_KEY
  │
  └─ 배포
     ├─ Production (main branch)
     ├─ Preview (PR branches)
     └─ Development (feature branches)

Production URL
  └─ https://your-domain.vercel.app
     ├─ / (홈)
     ├─ /invoice/[id] (견적서 상세)
     └─ /api/generate-pdf (PDF 생성 API)
```

---

## v3.0 아키텍처 추가사항

### 관리자 영역 구조

```
┌─────────────────────────────────────────────────────────┐
│ Notion Workspace (v3.0 신규)                           │
│  ├─ Invoices DB (기존)                                 │
│  ├─ InvoiceItems DB (기존)                            │
│  ├─ Reports DB (신규) ← 신고 데이터                    │
│  └─ EmailLogs DB (신규) ← 발송 이력                   │
└─────────────────────────────────────────────────────────┘
            ↓
Next.js Admin Routes
  ├─ /admin (대시보드, ISR 60초)
  ├─ /admin/invoices (목록, 페이지네이션)
  ├─ /admin/clients (클라이언트 요약)
  ├─ /admin/reports (신고 관리, ISR 30초)
  └─ /login (인증)

API Routes
  ├─ /api/auth/login (세션 생성)
  ├─ /api/auth/logout (세션 제거)
  ├─ /api/admin/share-email (이메일 발송)
  └─ /api/admin/reports/[id] (신고 상태 변경)
```

### 인증 및 보안 (v3.0)

**세션 구조**:

```typescript
// HMAC-SHA256 서명 기반
Session {
  id: string;
  exp: number;
  iat: number;
  signature: string;
}

// 검증 단계
1. 쿠키에서 토큰 추출
2. 타임스탬프 검증 (만료 확인)
3. HMAC 서명 검증 (timingSafeEqual 사용)
4. 관리자 페이지 접근 허용/거부
```

**입력 검증**:

- 이메일: RFC 5322 + 길이 (3-254자)
- 신고 상태: enum 검증 (pending, reviewing, resolved)
- 메시지: 길이 제한 + XSS 방지 (개행 제거)

**속도 제한**:

- 이메일 발송: 분당 5건, 시간당 30건
- 로그인 시도: 분당 5회

### 캐싱 전략 (v3.0, Task 616)

**React.cache() 메모이제이션**:

```typescript
// 렌더링 사이클 내 중복 요청 제거
export const getInvoiceFromNotion = cache(getInvoiceFromNotionImpl);
export const getInvoiceListFromNotion = cache(getInvoiceListFromNotionImpl);
```

**ISR (Incremental Static Regeneration)**:

| 페이지          | 재검증 시간 | 이유                   |
| --------------- | ----------- | ---------------------- |
| /admin          | 60초        | 발행자용 실시간성 필요 |
| /admin/reports  | 30초        | 신고 상태 자주 변경    |
| /admin/invoices | 동적        | 커서별 독립 캐시       |
| /invoice/[id]   | 동적        | 개별 요청시 생성       |

---

## 📈 성능 최적화 전략

### v3.0 최적화 완료 항목

| Task | 최적화 항목                 | 상태    |
| ---- | --------------------------- | ------- |
| 612  | 대시보드 구축 (React.cache) | ✅ 완료 |
| 613  | 이메일 발송 (속도 제한)     | ✅ 완료 |
| 614  | 신고 관리 (ISR 30초 설정)   | ✅ 완료 |
| 616  | 성능 최적화 (캐싱 재점검)   | ✅ 완료 |

### Notion API 호출 최적화

**현재 호출 빈도**:

- 대시보드 로드: 2회 API 호출
- 60초 ISR: 분당 2회만 호출 (Notion rate limit 안전)
- N+1 문제: React.cache()로 해결

**병목 분석**:

- Notion API 응답: 500-800ms (네트워크)
- 캐싱 없을 시: 분당 120회 호출
- 캐싱 적용 후: 분당 2회 호출 (60배 개선)

---

## 🔄 개발 단계별 로드맵

```
Phase 1: 골격 ✅
├─ Task 001: 라우팅 ✅
├─ Task 002: 타입 ✅
└─ Task 003: UI 컴포넌트 ✅

Phase 2: UI 완성 ✅
├─ Task 004: UI 레이아웃 ✅
├─ Task 005: Notion 연동 ✅
├─ Task 006: 데이터 파싱 ✅
└─ Task 007: PDF 생성 ✅

Phase 3: 관리자 영역 ✅
├─ Task 601-602: 인증 시스템 ✅
├─ Task 603-605: 대시보드 ✅
├─ Task 606-608: 레이아웃 ✅
├─ Task 609-615: 이메일/신고 ✅

Phase 4: 최적화 및 배포 🟡
├─ Task 616: 성능 최적화 ✅ (진행 중)
└─ Task 617: 운영 문서 및 배포 🟡 (진행 중)
```

---

## 배포 구조 (v3.0)

```
GitHub Repository
  ↓ (push to main)
Vercel CI/CD
  ├─ 빌드 단계
  │  ├─ npm install
  │  ├─ npm run check-all (lint + format + typecheck)
  │  ├─ npm run build (Turbopack 최적화)
  │  └─ 번들 분석
  │
  ├─ 환경 변수 설정
  │  ├─ NOTION_API_KEY (v1.0)
  │  ├─ ADMIN_PASSWORD (v3.0)
  │  ├─ ADMIN_SESSION_SECRET (v3.0)
  │  ├─ NOTION_DATABASE_ID (v3.0)
  │  ├─ NOTION_REPORTS_DATABASE_ID (v3.0)
  │  ├─ EMAIL_API_KEY (v3.0, 선택)
  │  └─ EMAIL_FROM_ADDRESS (v3.0, 선택)
  │
  └─ 배포
     ├─ Production (main branch)
     ├─ Preview (PR branches)
     └─ Development (feature branches)

Production URL
  └─ https://invoice-web.vercel.app
     ├─ / (홈)
     ├─ /invoice/[id] (견적서 상세)
     ├─ /login (관리자 로그인)
     ├─ /admin (대시보드)
     ├─ /admin/invoices (목록)
     ├─ /admin/reports (신고)
     └─ /api/* (API routes)
```

---

**📝 문서 버전**: v3.0
**📅 작성일**: 2026-08-07
**🏗️ 상태**: Phase 4 진행 중 (Task 616-617)
