'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface HeroProps {
  title?: string
  subtitle?: string
  description?: string
}

export function Hero({
  title = 'Next.js 모던 웹 스타터킷',
  subtitle = 'React 19 + TypeScript + TailwindCSS로 구축된 프로덕션 레디 스타터',
  description = 'ShadcnUI, 다크모드, 반응형 디자인이 기본으로 포함되어 있습니다.',
}: HeroProps) {
  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-muted-foreground">
          {subtitle}
        </p>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg">
            시작하기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => window.open('https://github.com', '_blank')}>
            GitHub에서 보기
          </Button>
        </div>
      </div>
    </section>
  )
}
