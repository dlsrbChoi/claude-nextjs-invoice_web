# Development Guidelines for AI Agents

## Project Overview

**프로젝트명**: invoice-web (Notion 기반 견적서 관리 시스템 MVP)

**기술 스택**:
- 프레임워크: Next.js 16, React 19, TypeScript 5 (strict mode)
- UI: shadcn/ui (base-nova style), @base-ui/react 기반
- 스타일: TailwindCSS v4, oklch 색상 시스템
- 테마: next-themes (light/dark/system)
- 아이콘: lucide-react
- 유틸리티: class-variance-authority (CVA), clsx, tailwind-merge

**주요 기능** (MVP):
- Notion 페이지 ID 입력으로 견적서 조회
- 견적서 상세 정보 표시
- PDF 다운로드 (브라우저 인쇄)

## Architecture Standards

### Next.js 16 App Router 규칙

**라우트 구조**:
- 모든 라우트는 `src/app/[path]/page.tsx` 형식
- 동적 라우트: `/invoice/[notionPageId]/page.tsx`

**⚠️ CRITICAL - Promise 기반 params 규칙**:
```typescript
// ✅ 올바른 형식
export async function generateMetadata({ params }: Props) {
  const { notionPageId } = await params  // 반드시 await
  // ...
}

export default async function InvoicePage({ params }: Props) {
  const { notionPageId } = await params  // 반드시 await
  // ...
}

// ❌ 금지됨 - params를 await하지 않음
export default function InvoicePage({ params }) {
  const id = params.notionPageId  // 오류: Promise<string>
}
```

**라우트 추가 시 필수 요소**:
- `page.tsx`: 페이지 컴포넌트
- `error.tsx` (필요시): 에러 경계 (동적 라우트에 권장)
- `not-found.tsx` (필요시): 404 처리
- `layout.tsx` (필요시): 레이아웃 공유
- `generateMetadata()`: SEO 메타데이터

**예시 - 새 라우트 추가**:
```typescript
// src/app/quote/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '견적서 작성',
}

export default function QuotePage() {
  return <div>견적서 작성 페이지</div>
}
```

## Component Structure Standards

### 컴포넌트 디렉토리 규칙

**src/components/ui/**:
- shadcn/ui 기본 컴포넌트만 배치
- 예: Button, Card, Input, Badge, Separator, Dialog 등
- 모든 UI 컴포넌트는 `@base-ui/react` 기본 컴포넌트를 래핑
- CVA(class-variance-authority)로 variant, size 정의
- `cn()` 함수로 클래스 병합

**src/components/layout/**:
- 페이지 레이아웃 컴포넌트
- 예: Header, Footer, Container, ThemeToggle
- 클라이언트 컴포넌트 (`'use client'` 지시어 사용)

**src/components/patterns/**:
- 재사용 가능한 패턴 컴포넌트
- 예: PageHeader, EmptyState, ErrorBoundary
- 여러 페이지에서 사용되는 UI 패턴

**src/components/invoice/**:
- 견적서 기능 전용 컴포넌트
- 예: InvoiceLookup, InvoiceDetail, InvoiceTable
- 비즈니스 로직 포함 가능

### 컴포넌트 구현 규칙

**UI 컴포넌트 예시**:
```typescript
// src/components/ui/button.tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        outline: 'border border-input bg-white hover:bg-gray-100',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

**서버 컴포넌트 규칙**:
- 기본값: 서버 컴포넌트 (async/await 가능)
- 상태, 이벤트 필요 시만 `'use client'` 지시어 사용
- 데이터 페칭은 서버 컴포넌트에서 수행

**클라이언트 컴포넌트 규칙**:
```typescript
'use client'

import { useState } from 'react'

export function InvoiceLookup() {
  const [pageId, setPageId] = useState('')

  return (
    // JSX
  )
}
```

## Styling Standards

### TailwindCSS v4 + oklch 규칙

**색상 변수 (src/app/globals.css)**:
```css
@layer theme {
  :root {
    --color-primary: oklch(var(--primary-lightness) var(--primary-chroma) var(--primary-hue));
    --color-secondary: oklch(...);
    /* ... */
  }

  .dark {
    --primary-lightness: 0.6;
    /* 다크 모드 색상 변수 */
  }
}
```

**클래스 병합 필수 규칙**:
```typescript
// ✅ 올바름 - cn() 함수 사용
import { cn } from '@/lib/utils'

export function Card({ className, ...props }) {
  return (
    <div className={cn('bg-white rounded-lg shadow-md', className)} {...props} />
  )
}

// ❌ 금지됨 - 직접 클래스 병합
export function Card({ className, ...props }) {
  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`} {...props} />
  )
}
```

**다크 모드 구현**:
```typescript
// ✅ 올바름 - dark: 접두사
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  내용
</div>

// ❌ 금지됨 - 수동 media query
const darkStyle = useTheme() === 'dark' ? { background: '#111' } : {}
```

**반응형 디자인**:
```typescript
// TailwindCSS 브레이크포인트 사용
<div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
  내용
</div>
```

## Notion Integration Standards

### src/lib/notion.ts 규칙

**API 클라이언트 구조**:
```typescript
// ✅ 올바른 구현 예시
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function getInvoiceFromNotion(pageId: string) {
  const normalizedId = normalizeNotionPageId(pageId)
  const page = await notion.pages.retrieve({ page_id: normalizedId })
  
  const invoice = parseInvoiceFromNotionPage(page)
  const items = await parseInvoiceItems(page.id)
  
  return { ...invoice, items }
}

function normalizeNotionPageId(id: string): string {
  // 하이픈 제거, 대소문자 통일
  return id.replace(/-/g, '').toLowerCase()
}

function parseInvoiceFromNotionPage(page: any): Invoice {
  // page.properties에서 데이터 추출
  // 타입 검증 필수
}

async function parseInvoiceItems(pageId: string): Promise<InvoiceItem[]> {
  // 테이블 블록이나 데이터베이스 쿼리로 항목 추출
}
```

**데이터 검증**:
```typescript
// ✅ 필수: 타입 검증
export async function getInvoiceFromNotion(pageId: string): Promise<Invoice> {
  try {
    const data = await notion.pages.retrieve({ page_id: pageId })
    
    // 필드 존재 확인
    if (!data.properties.invoiceNumber) {
      throw new Error('invoiceNumber 필드 누락')
    }
    
    return parseInvoiceFromNotionPage(data)
  } catch (error) {
    // 에러 로깅 및 재던지기
    console.error('Notion API 호출 실패:', error)
    throw error
  }
}
```

**페이지 ID 형식**:
- 32자 16진수: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- 하이픈 포함: `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`
- 모두 `normalizeNotionPageId()`로 처리 필수

### src/lib/types.ts 규칙

**타입 정의**:
```typescript
// Notion 관련 모든 타입을 여기에 정의
export interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  issueDate: Date
  dueDate: Date
  amount: number
  currency: string
  items: InvoiceItem[]
  status: 'draft' | 'sent' | 'paid'
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface NotionPage {
  id: string
  properties: Record<string, any>
}
```

**Notion 데이터 구조 변경 시**:
- `src/lib/types.ts` 타입 업데이트
- `src/lib/notion.ts` 파싱 함수 동시 수정 (필수)
- 컴포넌트에서 사용하는 곳 타입 체크

## File Interaction Standards

### 파일 간 의존성 지도

**라우트 추가 시**:
```
src/app/[route]/page.tsx (새 페이지)
  ├─ generateMetadata() 필수 작성
  ├─ error.tsx 추가 (동적 라우트인 경우)
  ├─ layout.tsx (필요시 생성)
  └─ 컴포넌트 import
```

**새 UI 컴포넌트 추가 시**:
```
src/components/ui/[component].tsx (새 컴포넌트)
  ├─ components.json 설정 확인
  │  └─ style: "base-nova"
  │  └─ baseColor: "neutral"
  │  └─ iconLibrary: "lucide"
  ├─ @base-ui/react 기본 컴포넌트 래핑
  ├─ CVA로 variant/size 정의
  └─ cn() 함수로 클래스 병합
```

**Notion 데이터 구조 변경 시** (필수 동시 수정):
```
Notion 데이터 구조 변경
  ├─ src/lib/types.ts (Invoice 타입 수정)
  ├─ src/lib/notion.ts (파싱 함수 수정)
  ├─ src/components/invoice/InvoiceDetail.tsx (렌더링 수정)
  └─ 관련 페이지 타입 체크
```

**환경 설정 변경 시**:
- `.env.local` 변경 → 서버 재시작 필수
- `NOTION_API_KEY` 추가/변경 시 `.env.example` 동시 업데이트

## Prohibited Actions

### ❌ 절대 금지 사항

1. **Next.js 16 params 규칙 위반**:
   - `params`를 `await` 하지 않음
   - 동적 라우트에서 동기적으로 params 접근

2. **스타일링 규칙 위반**:
   - `cn()` 함수 없이 클래스 직접 병합
   - globals.css 변수 없이 하드코딩된 색상 사용
   - Tailwind 클래스를 인라인 스타일로 변경

3. **테스트 자동화 추가**:
   - jest, vitest, Playwright 등 테스트 프레임워크 설치 금지
   - `*.test.ts`, `*.spec.ts` 파일 생성 금지
   - 현재는 수동 브라우저 테스트만 지원

4. **Notion API 직접 호출**:
   - 컴포넌트에서 `@notionhq/client` 직접 import 금지
   - 모든 Notion API 호출은 `src/lib/notion.ts` 함수 사용 필수

5. **타입 안전성 무시**:
   - `any` 타입 사용 최소화
   - props 타입 명시 필수
   - API 응답 타입 정의 필수

6. **파일 구조 무시**:
   - UI 컴포넌트를 `src/components/invoice/`에 생성
   - 비즈니스 로직을 `src/components/ui/`에 작성
   - 라우트를 `src/pages/`에 생성 (App Router 사용)

7. **의존성 추가 제약**:
   - 승인되지 않은 새로운 패키지 설치 금지
   - shadcn/ui 컴포넌트 추가 시 components.json 설정 확인

## AI Decision-Making Priority

### 모호한 상황에서의 의사결정 순서

1. **파일 위치 결정**:
   1. shadcn/ui 컴포넌트? → `src/components/ui/`
   2. 레이아웃 관련? → `src/components/layout/`
   3. 재사용 패턴? → `src/components/patterns/`
   4. 견적서 비즈니스 로직? → `src/components/invoice/`

2. **컴포넌트 타입 결정**:
   1. 상태/이벤트 필요? → `'use client'` 클라이언트 컴포넌트
   2. 데이터 페칭 필요? → 서버 컴포넌트 (기본값)
   3. 레이아웃/전역 상태? → 클라이언트 컴포넌트

3. **스타일 구현 결정**:
   1. 재사용 가능한 컴포넌트? → CVA 변형 정의
   2. 일회성 스타일? → 클래스명 직접 사용 (cn() 함수 필수)
   3. 동적 스타일? → 동적 클래스 생성 (cn() 함수 필수)

4. **데이터 소스 결정**:
   1. Notion에서 조회? → `src/lib/notion.ts` 함수 호출
   2. 사용자 입력? → React state 또는 form library
   3. 로컬 상수? → `src/lib/` constants 파일

## Examples

### ✅ 올바른 예시

**새 라우트 추가**:
```typescript
// src/app/quote/create/page.tsx
import { Metadata } from 'next'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/patterns/page-header'

export const metadata: Metadata = {
  title: '견적서 작성 | Invoice Web',
  description: '새로운 견적서를 작성합니다.',
}

export default function CreateQuotePage() {
  return (
    <Container>
      <PageHeader title="견적서 작성" />
      {/* 내용 */}
    </Container>
  )
}
```

**새 UI 컴포넌트 추가**:
```typescript
// src/components/ui/form-input.tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'w-full px-3 py-2 border rounded-md text-sm',
  {
    variants: {
      error: {
        true: 'border-red-500 focus:ring-red-500',
        false: 'border-gray-300 focus:ring-blue-500',
      },
    },
    defaultVariants: {
      error: false,
    },
  }
)

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      className={cn(inputVariants({ error, className }))}
      ref={ref}
      {...props}
    />
  )
)

export { FormInput }
```

**Notion 데이터 활용**:
```typescript
// src/components/invoice/invoice-detail.tsx
import { getInvoiceFromNotion } from '@/lib/notion'
import { Invoice } from '@/lib/types'

interface InvoiceDetailProps {
  notionPageId: string
}

export async function InvoiceDetail({ notionPageId }: InvoiceDetailProps) {
  const invoice = await getInvoiceFromNotion(notionPageId)

  return (
    <div>
      <h1>{invoice.invoiceNumber}</h1>
      <p>{invoice.clientName}</p>
      <p>{invoice.amount} {invoice.currency}</p>
    </div>
  )
}
```

### ❌ 잘못된 예시

**금지됨 - params await 누락**:
```typescript
// ❌ 오류
export default function InvoicePage({ params }) {
  const id = params.notionPageId // Promise<string>을 문자열로 취급
}
```

**금지됨 - cn() 없이 클래스 병합**:
```typescript
// ❌ 오류
export function Card({ active }) {
  return (
    <div className={`bg-white ${active ? 'bg-blue-500' : ''}`}>
      {/* TailwindCSS 충돌 가능성 */}
    </div>
  )
}
```

**금지됨 - 직접 Notion API 호출**:
```typescript
// ❌ 오류
import { Client } from '@notionhq/client'

export async function InvoiceDetail({ pageId }) {
  const notion = new Client({ auth: process.env.NOTION_API_KEY })
  const page = await notion.pages.retrieve({ page_id: pageId })
  // 직접 API 호출 금지
}
```

**금지됨 - 테스트 파일 추가**:
```typescript
// ❌ 금지됨
// src/components/invoice/__tests__/invoice-detail.test.tsx
import { render } from '@testing-library/react'

describe('InvoiceDetail', () => {
  // 테스트 작성 금지
})
```
