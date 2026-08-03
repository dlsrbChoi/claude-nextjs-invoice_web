'use client'

import { Hero } from '@/components/patterns/hero'
import { FeatureGrid } from '@/components/patterns/feature-grid'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function Home() {
  return (
    <>
      <Hero />
      <Separator />
      <FeatureGrid />

      <section className="py-16 sm:py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            지금 시작하세요
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            이 스타터킷을 기반으로 자신의 프로젝트를 만들어보세요.
            모든 구성요소가 이미 준비되어 있습니다.
          </p>
          <Button size="lg" onClick={() => window.open('https://github.com', '_blank')}>
            GitHub에서 클론하기
          </Button>
        </div>
      </section>
    </>
  )
}
