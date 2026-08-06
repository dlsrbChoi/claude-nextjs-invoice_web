# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소의 코드를 작업할 때 참고할 지침을 제공합니다.

## 프로젝트 개요

노션 기반 견적서 관리 시스템 MVP. Next.js 16, React 19, TypeScript, TailwindCSS v4, shadcn/ui (base-ui 기반)를 활용한 프로덕션 레디 프로젝트입니다.

### 핵심 기능

**사용자 관점:**

- 홈페이지에서 Notion 견적서 페이지 ID 또는 URL 입력
- 견적서 상세 정보 조회
- PDF 다운로드 기능

**기술적 구현:**

- Notion API 연동으로 데이터베이스 기반 견적서 관리
- URL 검증 및 에러 처리
- 반응형 레이아웃

### 아키텍처 주요 특징

**앱 라우터 기반 구조** (`src/app/`)

- Next.js 16 App Router를 사용하여 폴더 기반 라우팅 구현
- 라우트:
  - `/` (홈페이지) - 견적서 조회 페이지
  - `/invoice/[notionPageId]` (동적 라우트) - 견적서 상세 조회
- 특수 파일:
  - `error.tsx` (에러 경계) - 전역 에러 처리
  - `not-found.tsx` (404 페이지) - 페이지 미존재 처리
  - `layout.tsx` (루트 레이아웃) - ThemeProvider, 헤더, 푸터 등 공통 레이아웃

**컴포넌트 계층** (`src/components/`)

- **UI 컴포넌트** (`src/components/ui/`): shadcn/ui 기본 컴포넌트 (Button, Card, Input, Badge, Separator 등)
  - `@base-ui/react` 기본 컴포넌트를 래핑해 shadcn 스타일 적용
  - `class-variance-authority` (CVA)로 변형/크기 패턴 구현
  - `cn()` 유틸리티 (`src/lib/utils.ts`)로 클래스 병합
- **레이아웃 컴포넌트** (`src/components/layout/`): 헤더, 푸터, 컨테이너, 테마 토글
- **패턴 컴포넌트** (`src/components/patterns/`): PageHeader, EmptyState
- **견적서 컴포넌트** (`src/components/invoice/`):
  - `InvoiceLookup`: Notion 페이지 ID 입력 폼
  - `InvoiceDetail`: 견적서 상세 정보 표시

**Notion 연동** (`src/lib/`)

- `notion.ts`: Notion API 클라이언트
  - `getInvoiceFromNotion()`: Notion 페이지에서 견적서 데이터 조회
  - `normalizeNotionPageId()`: Notion 페이지 ID 정규화
- `types.ts`: TypeScript 타입 정의 (Invoice, InvoiceItem, Notion 관련 타입)
- `format.ts`: 날짜 및 통화 포맷팅 유틸리티
- `utils.ts`: `cn()` 클래스 병합 유틸리티

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
NOTION_API_KEY=your_notion_api_key_here
```

Notion API 키는 [Notion Integration](https://www.notion.so/my-integrations)에서 생성할 수 있습니다.

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

### 수동 테스트

1. Notion 데이터베이스 생성 및 Integration 권한 설정
2. `.env.local`에 API 키 설정
3. `npm run dev`로 로컬 서버 실행
4. 홈페이지에서 Notion 페이지 ID 입력 테스트
5. 견적서 상세 페이지 로딩 및 표시 확인

### 주의사항

- 이 프로젝트에는 자동화된 단위/통합 테스트 스위트가 없습니다 (jest/vitest 미설정, `*.test.ts` 또는 `*.spec.ts` 파일 없음)
- 모든 검증은 수동 브라우저 테스트, 타입 체크, ESLint, Prettier로 진행됩니다
- Git hooks가 자동으로 실행되므로 로컬에서 `npm run check-all`이 성공하면 커밋/푸시 가능합니다

## 현재 제한사항 및 향후 개선

### MVP 범위 (현재 구현)

- Notion 페이지 ID 기반 견적서 조회
- 기본 견적서 정보 표시
- 브라우저 인쇄/PDF 다운로드

### 향후 개선사항

- Notion 테이블/데이터베이스 연동 강화
- 이메일 발송 기능
- 결제 상태 추적
- 버전 관리 및 히스토리
- 다국어 지원
