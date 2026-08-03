import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface Feature {
  icon: LucideIcon | null
  title: string
  description: string
}

interface FeatureGridProps {
  features?: Feature[]
}

const defaultFeatures = [
  {
    icon: null,
    title: 'Next.js 16',
    description: '최신 App Router와 서버 컴포넌트를 활용한 고성능 웹 개발',
  },
  {
    icon: null,
    title: 'TypeScript',
    description: '타입 안전성이 보장되는 개발 환경으로 버그를 사전에 방지',
  },
  {
    icon: null,
    title: 'TailwindCSS v4',
    description: '강력한 유틸리티 클래스로 빠르게 UI 구축',
  },
  {
    icon: null,
    title: 'ShadcnUI',
    description: '아름답고 접근성 좋은 UI 컴포넌트 라이브러리',
  },
  {
    icon: null,
    title: '다크모드',
    description: 'next-themes로 간편하게 라이트/다크 테마 전환',
  },
  {
    icon: null,
    title: '반응형 디자인',
    description: '모바일부터 데스크톱까지 모든 기기에 최적화된 레이아웃',
  },
]

export function FeatureGrid({ features = defaultFeatures }: FeatureGridProps) {
  return (
    <section id="features" className="py-16 sm:py-20">
      <div className="mb-12">
        <h2 className="text-3xl font-bold tracking-tight mb-4">주요 기능</h2>
        <p className="text-lg text-muted-foreground">
          현대적인 웹 개발에 필요한 모든 기능이 준비되어 있습니다.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="border">
            <CardHeader>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
