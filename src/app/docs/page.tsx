import Link from 'next/link'
import { DocSectionCard } from '@/components/patterns/doc-section-card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  BookOpen,
  Palette,
  Zap,
  Settings,
  Code2,
  Rocket,
  ExternalLink,
} from 'lucide-react'

export default function DocsPage() {
  return (
    <>
      <div className="text-center mb-12 pt-12">
        <h1 className="text-3xl font-bold tracking-tight">문서</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          스타터킷 사용법과 기능을 확인하세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
        <DocSectionCard
          icon={Rocket}
          title="시작하기"
          description="스타터킷을 설치하고 첫 프로젝트를 시작하는 방법"
          items={[
            '프로젝트 설치 (npm install)',
            '개발 서버 실행 (npm run dev)',
            '새 페이지 만드는 방법',
            'TypeScript 설정',
          ]}
          href="/examples/layout-patterns"
          linkLabel="레이아웃 예제 보기"
        />

        <DocSectionCard
          icon={Palette}
          title="UI 컴포넌트"
          description="shadcn/ui 기반의 아름다운 컴포넌트 라이브러리"
          items={[
            'Button, Card, Input 등 15개 컴포넌트',
            'base-nova 스타일로 일관된 디자인',
            'Tailwind CSS로 쉽게 커스터마이징',
            '더 많은 컴포넌트 추가 설치 가능',
          ]}
          href="/examples/component-showcase"
          linkLabel="컴포넌트 쇼케이스"
        />

        <DocSectionCard
          icon={Zap}
          title="훅 라이브러리"
          description="usehooks-ts의 31개 유틸리티 훅으로 개발을 빠르게"
          items={[
            'useMediaQuery, useLocalStorage 등',
            'useCounter, useToggle로 상태 관리',
            'useCopyToClipboard로 클립보드 다루기',
            'useWindowSize로 반응형 처리',
          ]}
          href="/examples/usehooks-ts-demo"
          linkLabel="훅 라이브러리 데모"
        />

        <DocSectionCard
          icon={Settings}
          title="구성 및 설정"
          description="테마 커스터마이징과 스타일 설정 방법"
          items={[
            'next-themes로 다크모드 구현',
            'oklch 형식의 CSS 변수로 색상 변경',
            'Tailwind CSS v4로 고급 스타일링',
            '환경 변수 설정하기',
          ]}
          href="/examples/theming-and-dark-mode"
          linkLabel="테마 커스터마이징"
        />
      </div>

      <Separator className="my-12" />

      <section className="py-8">
        <h2 className="text-2xl font-bold mb-6">빠른 링크</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            nativeButton={false}
            className="h-12"
            render={
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2"
              />
            }
          >
            <Code2 className="h-4 w-4" />
            GitHub 저장소
            <ExternalLink className="h-3 w-3" />
          </Button>

          <Button
            nativeButton={false}
            variant="outline"
            className="h-12"
            render={
              <Link href="/examples" className="inline-flex items-center justify-center gap-2" />
            }
          >
            <Zap className="h-4 w-4" />
            모든 예제 보기
          </Button>

          <Button
            nativeButton={false}
            variant="outline"
            className="h-12"
            render={
              <Link href="/#features" className="inline-flex items-center justify-center gap-2" />
            }
          >
            <BookOpen className="h-4 w-4" />
            주요 기능 보기
          </Button>
        </div>
      </section>
    </>
  )
}
