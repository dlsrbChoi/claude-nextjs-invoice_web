# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 모던 웹 스타터킷. React 19, TypeScript, TailwindCSS v4, shadcn/ui (base-ui 기반)를 활용한 프로덕션 레디 프로젝트입니다.

### Architecture Highlights

**App Router 기반 구조** (`src/app/`)
- Next.js 16 App Router를 사용하여 폴더 기반 라우팅 구현
- 동적 라우트: `[slug]` 패턴으로 예제 상세 페이지 구현 (`src/app/examples/[slug]/page.tsx`)
- 특수 파일: `error.tsx` (에러 바운더리), `loading.tsx` (라우트 단위 로딩), `not-found.tsx` (404 페이지)
- 루트 레이아웃 (`src/app/layout.tsx`)에서 ThemeProvider, Header, Footer 등 공통 레이아웃 설정

**컴포넌트 계층** (`src/components/`)
- **UI 컴포넌트** (`src/components/ui/`): shadcn/ui 원자 컴포넌트 (Button, Card, Input 등)
  - `@base-ui/react` 원시 컴포넌트를 래핑해 shadcn 스타일 적용
  - `class-variance-authority` (CVA)로 variant/size 패턴 구현
  - `cn()` 유틸리티 (`src/lib/utils.ts`)로 클래스 병합 (clsx + tailwind-merge)
- **레이아웃 컴포넌트** (`src/components/layout/`): Header, Footer, MobileNav, ThemeToggle, Container
  - Header/MobileNav에서 `src/lib/nav.ts`의 navItems 참조해 메뉴 렌더링
- **패턴 컴포넌트** (`src/components/patterns/`): 재사용 가능한 복합 컴포넌트 (Hero, FeatureGrid, PageHeader, CodeBlock, DocSectionCard 등)
- **예제 데모** (`src/components/examples/`): 6개 기능 데모 컴포넌트
  - ComponentShowcaseDemo, FormBasicsDemo, LayoutPatternsDemo, UseHooksTsDemo, ClientFetchDemo, ThemingDemo
  - `src/app/examples/[slug]/page.tsx`의 `demosMap`에서 동적으로 로드됨

**데이터/설정** (`src/lib/`)
- `utils.ts`: `cn()` 클래스 병합 유틸리티
- `nav.ts`: 헤더/모바일 네비게이션 메뉴 구조 정의
- `examples.ts`: 6개 예제 메타데이터 (slug, title, description, code, icon 등) + `getExampleBySlug()` 함수

**스타일링**
- `src/app/globals.css`: TailwindCSS v4 + oklch 색상 변수 정의
- 라이트/다크 모드를 `:root` 및 `.dark` 선택자로 분리
- `next-themes`로 테마 전환 로직 구현 (`src/components/theme-provider.tsx`)

### Next.js 16 Breaking Changes

이 프로젝트는 최신 Next.js 16을 사용하므로 다음을 주의:
- **동적 라우트 params는 Promise**: `params: Promise<{slug: string}>`로 선언되며, 반드시 `await params`로 처리해야 함 (`src/app/examples/[slug]/page.tsx:73-78` 참조)
- **generateStaticParams**: 동적 라우트를 정적 생성하려면 필수 (`src/app/examples/[slug]/page.tsx:14-18`)
- **shadcn/ui "base-nova" 스타일**: `@base-ui/react` 원시 컴포넌트 기반으로, `nativeButton` + `render` prop 패턴 사용 (`src/components/ui/button.tsx`)

## Common Commands

```bash
# 개발 서버 실행 (localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드된 앱 실행 (로컬에서 프로덕션 모드 테스트)
npm run start

# ESLint 실행 (린트 검사)
npm run lint
```

## Key Dependencies

- **프레임워크**: Next.js 16, React 19, TypeScript 5
- **스타일**: TailwindCSS v4, oklch 색상 시스템
- **UI**: shadcn/ui (base-nova), @base-ui/react (headless 컴포넌트 기반)
- **테마**: next-themes (라이트/다크/시스템 모드)
- **유틸리티**: 
  - `class-variance-authority`: 컴포넌트 variant 정의
  - `clsx` + `tailwind-merge`: 클래스 병합 (조건부/동적 클래스 충돌 해결)
  - `usehooks-ts`: useMediaQuery, useLocalStorage 등 검증된 커스텀 훅
  - `lucide-react`: SVG 아이콘 라이브러리
  - `sonner`: 토스트 알림 (진행 상황 메시지, 에러 표시 등)

## File Path Aliases

`tsconfig.json`에서 `@/*` → `./src/*`로 설정:
```tsx
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

## Page Structure Pattern

새 페이지/라우트를 추가할 때 권장 패턴:

```tsx
// src/app/feature/page.tsx
import { PageHeader } from '@/components/patterns/page-header'
import { Container } from '@/components/layout/container'

export default function Feature() {
  return (
    <>
      <PageHeader 
        title="기능명"
        description="설명"
      />
      <Container>
        {/* 콘텐츠 */}
      </Container>
    </>
  )
}
```

동적 라우트의 경우:
```tsx
// src/app/resource/[id]/page.tsx
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }]
}

export default async function ResourceDetail({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params  // ⚠️ 반드시 await!
  // ...
}
```

## Styling Convention

- **클래스 병합**: `cn()` 함수 사용하여 동적 클래스 충돌 해결
  ```tsx
  className={cn("px-4 py-2", variant === 'primary' && "bg-primary")}
  ```
- **색상 변수**: `src/app/globals.css`의 oklch 변수 참조
  ```css
  bg-primary, text-foreground, border-border 등
  ```
- **반응형**: TailwindCSS 브레이크포인트 (`md:`, `lg:` 등)
- **다크모드**: `dark:` prefix로 자동 처리 (next-themes 활용)

## Examples & Demos

프로젝트의 `/examples` 페이지는 6가지 기능 데모를 제공합니다:
1. **component-showcase**: shadcn UI 컴포넌트 15개 전시
2. **form-basics**: React state + HTML5 검증을 활용한 폼
3. **layout-patterns**: Tailwind 그리드/Separator 활용
4. **usehooks-ts-demo**: 6개 유틸리티 훅 (useCounter, useToggle, useLocalStorage, useCopyToClipboard, useWindowSize, useDarkMode)
5. **data-fetching**: 서버 컴포넌트 + 클라이언트 fetch 비교
6. **theming-and-dark-mode**: 테마 전환 및 CSS 변수 커스터마이징

각 데모는 `src/components/examples/*.tsx`에서 구현되며, `src/app/examples/[slug]/page.tsx`에서 동적 렌더링됨. 라이브 데모 + 소스코드 표시 기능 제공.

## Development Workflow

1. **새 페이지**: `src/app/[route]/page.tsx` 생성 (자동 라우팅)
2. **새 UI 컴포넌트**: `src/components/ui/` 추가 (CVA 패턴 사용)
3. **복합 컴포넌트**: `src/components/patterns/` 추가
4. **클라이언트 로직**: `'use client'` 지시어로 컴포넌트 마크 (useState, 이벤트 핸들러 등)
5. **서버 데이터**: 페이지/레이아웃 컴포넌트에서 `async` 선언 후 직접 fetch
6. **타입 안전**: TypeScript strict mode 활성화 — 컴포넌트 props, API 응답 등에 타입 명시

## Testing & Validation

- **TypeScript**: `npm run dev` 실행 시 자동 타입 체크 (strict mode)
- **ESLint**: `npm run lint`로 코드 품질 검사
- **시각적 검증**: `/examples` 페이지에서 기능 및 UI 확인
