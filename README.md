# Next.js 16 모던 웹 스타터킷

Next.js 16, React 19, TypeScript, TailwindCSS v4를 기반으로 만든 프로덕션 레디 웹 스타터킷입니다.

## 🎯 주요 기능

- **Next.js 16** — App Router와 서버 컴포넌트를 활용한 최신 웹 개발
- **React 19** — 최신 React 기능과 성능 개선
- **TypeScript** — 타입 안전성이 보장되는 개발 환경
- **TailwindCSS v4** — 모던 스타일링 프레임워크
- **ShadcnUI (base-nova)** — 아름답고 접근성 좋은 UI 컴포넌트
- **다크모드** — next-themes로 구현된 라이트/다크/시스템 테마 전환
- **반응형 디자인** — 모바일부터 데스크톱까지 모든 기기 대응
- **usehooks-ts** — useMediaQuery, useLocalStorage 등 검증된 유틸리티 훅
- **ESLint & TypeScript** — 코드 품질 관리

## 📁 폴더 구조

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # 루트 레이아웃 (헤더, 푸터 포함)
│   ├── page.tsx              # 홈 페이지
│   ├── globals.css           # 전역 스타일 (TailwindCSS, 테마 변수)
│   ├── loading.tsx           # 라우트 레벨 로딩 UI
│   ├── error.tsx             # 에러 바운더리
│   └── not-found.tsx         # 404 페이지
├── components/
│   ├── ui/                   # shadcn UI 원자 컴포넌트 (button, card, input 등)
│   ├── layout/               # 레이아웃 컴포넌트
│   │   ├── header.tsx        # 상단 헤더 (로고, 네비, 테마 토글)
│   │   ├── footer.tsx        # 하단 푸터
│   │   ├── container.tsx     # max-width 래퍼
│   │   ├── mobile-nav.tsx    # Sheet 기반 모바일 메뉴
│   │   └── theme-toggle.tsx  # 다크모드 토글
│   ├── patterns/             # 재사용 가능한 컴포넌트 패턴
│   │   ├── hero.tsx          # 히어로 섹션
│   │   ├── feature-grid.tsx  # 기능 그리드
│   │   ├── page-header.tsx   # 페이지 타이틀
│   │   └── empty-state.tsx   # 빈 상태 표시
│   └── theme-provider.tsx    # next-themes 래퍼
└── lib/
    ├── utils.ts              # 유틸리티 함수 (cn() 클래스 병합)
    └── hooks/                # 커스텀 훅 (필요시 추가)
```

## 🚀 시작하기

### 1. 프로젝트 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 애플리케이션이 실행됩니다.

### 2. 새 페이지 만들기

`src/app` 디렉토리에 새 폴더를 만들고 `page.tsx` 파일을 추가하면 자동으로 라우트가 생성됩니다.

```tsx
// src/app/about/page.tsx
import { PageHeader } from '@/components/patterns/page-header'

export default function About() {
  return (
    <>
      <PageHeader 
        title="About Us"
        description="We are building amazing products"
      />
      {/* 콘텐츠 추가 */}
    </>
  )
}
```

### 3. 컴포넌트 사용

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>제목</CardTitle>
        <CardDescription>설명</CardDescription>
      </CardHeader>
      <CardContent>
        <Button>클릭하세요</Button>
      </CardContent>
    </Card>
  )
}
```

## 🎨 테마 커스터마이징

다크모드는 `next-themes`로 구현되어 있으며, 색상 변수는 `src/app/globals.css`에 정의되어 있습니다.

oklch 포맷의 CSS 변수를 수정하여 색상을 커스터마이징할 수 있습니다:

```css
:root {
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... 다른 변수들 */
}

.dark {
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  /* ... */
}
```

## 📦 설치된 라이브러리

- **프레임워크**: Next.js 16, React 19, TypeScript
- **스타일**: TailwindCSS v4
- **UI**: ShadcnUI (base-nova 스타일, @base-ui/react 기반)
- **아이콘**: lucide-react
- **테마**: next-themes
- **알림**: sonner (toast)
- **유틸리티**: 
  - clsx + tailwind-merge (클래스 병합)
  - class-variance-authority (컴포넌트 변형)
  - usehooks-ts (useMediaQuery, useLocalStorage 등)

## 🔧 개발 팁

### useMediaQuery로 반응형 처리

```tsx
'use client'

import { useMediaQuery } from 'usehooks-ts'

export function ResponsiveComponent() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  
  return isDesktop ? <DesktopLayout /> : <MobileLayout />
}
```

### useLocalStorage로 로컬 저장소 사용

```tsx
'use client'

import { useLocalStorage } from 'usehooks-ts'

export function Counter() {
  const [count, setCount] = useLocalStorage('count', 0)
  
  return (
    <div>
      Count: {count}
      <button onClick={() => setCount(count + 1)}>증가</button>
    </div>
  )
}
```

### toast 알림 사용

```tsx
import { Toaster, toast } from 'sonner'

// layout.tsx에 Toaster 추가
export default function Layout() {
  return (
    <>
      <main>{/* ... */}</main>
      <Toaster />
    </>
  )
}

// 사용
function MyComponent() {
  return (
    <button onClick={() => toast.success('성공했습니다!')}>
      알림 보기
    </button>
  )
}
```

## 📚 추가 컴포넌트 설치

shadcn UI에서 더 많은 컴포넌트를 설치할 수 있습니다:

```bash
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add table
# ... 등등
```

## ✅ 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드된 애플리케이션 실행
npm run start

# 린트 검사
npm run lint
```

## 📖 참고 자료

- [Next.js 문서](https://nextjs.org/docs)
- [React 문서](https://react.dev)
- [TailwindCSS 문서](https://tailwindcss.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com)
- [next-themes 문서](https://github.com/pacocoursey/next-themes)
- [usehooks-ts 문서](https://usehooks-ts.com)

## 📄 라이선스

MIT License

---

이 스타터킷을 기반으로 멋진 프로젝트를 만들어보세요! 😎
