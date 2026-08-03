import Link from 'next/link'
import { examples } from '@/lib/examples'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function ExamplesPage() {
  return (
    <>
      <div className="text-center mb-12 pt-12">
        <h1 className="text-3xl font-bold tracking-tight">예제 모음</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          스타터킷에 포함된 기능을 실제 동작하는 예제로 확인해보세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
        {examples.map((example) => {
          const Icon = example.icon
          return (
            <Card key={example.slug} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{example.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {example.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {example.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  nativeButton={false}
                  className="mt-4 w-full"
                  render={
                    <Link
                      href={`/examples/${example.slug}`}
                      className="inline-flex items-center justify-center gap-2"
                    />
                  }
                >
                  예제 보기
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
