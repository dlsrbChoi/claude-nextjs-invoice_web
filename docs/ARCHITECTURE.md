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
})
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
console.error('Notion API Error:', error.message) // "401: Unauthorized - Invalid API Key"

// ✅ 올바른 방법 - 마스킹
console.error('Notion API Error: 인증 실패')
return { error: '견적서 조회에 실패했습니다. 잠시 후 다시 시도해주세요.' }
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

## 📈 성능 최적화 전략

### Task별 최적화 계획

| Task | 최적화 항목 | 상태 |
|------|-----------|------|
| Task 004 | 로딩 UI (Skeleton) | ✅ 완료 |
| Task 006 | Notion API 캐싱 | ⏳ 계획 |
| Task 007 | PDF 생성 최적화 (동적 import) | ⏳ 계획 |
| Task 009 | 전체 성능 최적화 | ⏳ 계획 |
| Task 010 | 접근성 개선 | ⏳ 계획 |

### 캐싱 전략 (Task 009)

```typescript
// Notion API 응답 캐싱
export async function getInvoiceFromNotion(pageId: string): Promise<Invoice> {
  // fetch 캐시 설정
  const response = await fetch(url, {
    next: { revalidate: 3600 } // 1시간마다 재검증
  })
}

// 메타데이터 캐싱
export async function generateMetadata({ params }) {
  // 기존 getInvoiceFromNotion 결과 재사용
  // (중복 API 호출 방지)
}
```

---

## 🔄 개발 단계별 로드맵

```
Phase 1: 골격 ✅
├─ Task 001: 라우팅 ✅
├─ Task 002: 타입 ✅
└─ Task 003: UI 컴포넌트 ✅

Phase 2: UI 완성 🟡
├─ Task 004: UI 레이아웃 ✅
├─ Task 005: Notion 연동 기반 (현재)
└─ Task 006: 데이터 파싱
└─ Task 007: PDF 생성

Phase 3: 최적화 ⏳
├─ Task 008: 에러 처리
├─ Task 009: 성능 최적화
└─ Task 010: 접근성 개선

Phase 4: 배포 ⏳
└─ Task 011: 배포 준비
```

---

**📝 문서 버전**: v1.0
**📅 작성일**: 2026-08-06
**🏗️ 상태**: 아키텍처 설계 완료 (Task 005 준비)
