import { notFound } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { CodeBlock } from '@/components/patterns/code-block'
import { examples, getExampleBySlug } from '@/lib/examples'
import { ComponentShowcaseDemo } from '@/components/examples/component-showcase-demo'
import { FormBasicsDemo } from '@/components/examples/form-basics-demo'
import { LayoutPatternsDemo } from '@/components/examples/layout-patterns-demo'
import { UseHooksTsDemo } from '@/components/examples/usehooks-ts-demo'
import { ClientFetchDemo } from '@/components/examples/data-fetching-demo'
import { ThemingDemo } from '@/components/examples/theming-demo'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function generateStaticParams() {
  return examples.map((example) => ({
    slug: example.slug,
  }))
}

interface Post {
  id: number
  title: string
  body: string
}

async function ServerFetchDemo(): Promise<React.ReactNode> {
  let posts: Post[] = []
  let hasError = false

  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3', {
      cache: 'force-cache',
    })
    if (!res.ok) throw new Error('Failed to fetch')
    posts = await res.json()
  } catch (error) {
    console.error('Server fetch error:', error)
    hasError = true
  }

  if (hasError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>데이터 로드 실패</AlertTitle>
        <AlertDescription>
          서버 요청 중 오류가 발생했습니다. 나중에 다시 시도해주세요.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div key={post.id} className="p-3 border rounded-lg space-y-2">
          <h4 className="font-semibold text-sm line-clamp-1">{post.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">{post.body}</p>
        </div>
      ))}
    </div>
  )
}

const demosMap: Record<string, React.ComponentType> = {
  'component-showcase': ComponentShowcaseDemo,
  'form-basics': FormBasicsDemo,
  'layout-patterns': LayoutPatternsDemo,
  'usehooks-ts-demo': UseHooksTsDemo,
  'theming-and-dark-mode': ThemingDemo,
}

export default async function ExampleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const example = getExampleBySlug(slug)

  if (!example) {
    notFound()
  }

  const DemoComponent = demosMap[slug] as React.ComponentType

  // 서버 페치 데이터를 미리 로드
  let serverFetchContent = null
  if (slug === 'data-fetching') {
    serverFetchContent = await ServerFetchDemo()
  }

  return (
    <>
      <div className="text-center mb-12 pt-12">
        <h1 className="text-3xl font-bold tracking-tight">{example.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {example.description}
        </p>
      </div>

      <div className="py-8 space-y-12">
        {/* 라이브 데모 섹션 */}
        <section>
          <h2 className="text-2xl font-bold mb-6">라이브 데모</h2>
          <div className="border rounded-lg p-6 bg-muted/30">
            {slug === 'data-fetching' ? (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">서버 컴포넌트 Fetch</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    빌드/요청 시점에 데이터를 가져옵니다 (캐싱 가능)
                  </p>
                  <div className="space-y-2">
                    {serverFetchContent}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">클라이언트 Fetch</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    버튼 클릭 등 이벤트에 반응하여 데이터를 가져옵니다
                  </p>
                  <ClientFetchDemo />
                </div>
              </div>
            ) : DemoComponent ? (
              <DemoComponent />
            ) : null}
          </div>
        </section>

        <Separator />

        {/* 소스코드 섹션 */}
        <section>
          <h2 className="text-2xl font-bold mb-6">소스코드</h2>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>코드 복사</AlertTitle>
            <AlertDescription>
              오른쪽 상단의 복사 버튼을 클릭하여 코드를 클립보드에 복사할 수 있습니다.
            </AlertDescription>
          </Alert>
          <CodeBlock code={example.code} />
        </section>
      </div>
    </>
  )
}
