import {
  PackageOpen,
  FormInput,
  LayoutGrid,
  Zap,
  Database,
  Moon,
} from 'lucide-react'

export interface ExampleItem {
  slug: string
  title: string
  description: string
  tags: string[]
  icon: typeof PackageOpen
  category: 'components' | 'forms' | 'layout' | 'hooks' | 'data-fetching' | 'theming'
  code: string
}

export const examples: ExampleItem[] = [
  {
    slug: 'component-showcase',
    title: '컴포넌트 쇼케이스',
    description: 'shadcn/ui 컴포넌트 15개를 한 화면에서 확인해보세요',
    tags: ['Button', 'Card', 'Badge', 'Dialog', 'Tooltip'],
    icon: PackageOpen,
    category: 'components',
    code: `import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'

export function ComponentShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Button Variants</h3>
        <div className="flex gap-2 flex-wrap">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Card Component</h3>
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>Card content goes here</CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Badges</h3>
        <div className="flex gap-2 flex-wrap">
          <Badge>Default</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="secondary">Secondary</Badge>
        </div>
      </div>
    </div>
  )
}`,
  },

  {
    slug: 'form-basics',
    title: '폼 예제',
    description: 'React state와 HTML5 검증을 사용한 기본 폼 만들기',
    tags: ['Input', 'Label', 'Textarea', 'Validation'],
    icon: FormInput,
    category: 'forms',
    code: `'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export function FormBasics() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('모든 필드를 입력해주세요')
      return
    }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      toast.error('유효한 이메일을 입력해주세요')
      return
    }
    toast.success('메시지가 전송되었습니다!')
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">이름</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="이름 입력"
        />
      </div>
      <div>
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="이메일 입력"
        />
      </div>
      <div>
        <Label htmlFor="message">메시지</Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="메시지 입력"
          rows={4}
        />
      </div>
      <Button type="submit" className="w-full">
        전송하기
      </Button>
    </form>
  )
}`,
  },

  {
    slug: 'layout-patterns',
    title: '레이아웃 예제',
    description: 'Container, 그리드, Separator를 활용한 레이아웃 패턴',
    tags: ['Container', 'Grid', 'Responsive', 'Separator'],
    icon: LayoutGrid,
    category: 'layout',
    code: `import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function LayoutPatterns() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">반응형 그리드</h2>
        <p className="text-sm text-muted-foreground mb-4">
          모바일: 1열, 태블릿: 2열, 데스크톱: 3열
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">Card {i}</CardTitle>
              </CardHeader>
              <CardContent>Content goes here</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-xl font-bold mb-4">섹션 구분</h2>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">Section 1</div>
          <Separator />
          <div className="p-4 bg-muted rounded-lg">Section 2</div>
          <Separator />
          <div className="p-4 bg-muted rounded-lg">Section 3</div>
        </div>
      </section>
    </div>
  )
}`,
  },

  {
    slug: 'usehooks-ts-demo',
    title: 'usehooks-ts 훅 라이브러리',
    description: '31개 유틸리티 훅 중 자주 쓰는 6개를 실제로 사용해보세요',
    tags: ['useCounter', 'useLocalStorage', 'useCopyToClipboard', 'useWindowSize'],
    icon: Zap,
    category: 'hooks',
    code: `'use client'

import { useCounter } from 'usehooks-ts'
import { useToggle } from 'usehooks-ts'
import { useLocalStorage } from 'usehooks-ts'
import { useCopyToClipboard } from 'usehooks-ts'
import { useWindowSize } from 'usehooks-ts'
import { useDarkMode } from 'usehooks-ts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Copy } from 'lucide-react'

export function UseHooksTsDemo() {
  const { count, increment, decrement } = useCounter(0)
  const { value: isToggled, toggle } = useToggle(false)
  const [saved, setSaved] = useLocalStorage('myValue', '')
  const [copiedText, copy] = useCopyToClipboard()
  const { width, height } = useWindowSize()
  const { isDarkMode } = useDarkMode()

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">useCounter</h3>
        <div className="flex items-center gap-2">
          <Button onClick={decrement}>-</Button>
          <span className="text-lg font-bold w-8 text-center">{count}</span>
          <Button onClick={increment}>+</Button>
        </div>
      </div>

      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">useLocalStorage</h3>
        <Input
          value={saved}
          onChange={(e) => setSaved(e.target.value)}
          placeholder="입력하면 저장됨"
        />
        <p className="text-xs text-muted-foreground mt-2">
          새로고침 후에도 값이 유지됩니다
        </p>
      </div>

      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">useCopyToClipboard</h3>
        <Button
          onClick={() => copy('복사된 텍스트!')}
          className="gap-2"
        >
          {copiedText === '복사된 텍스트!' ? (
            <>
              <Check className="h-4 w-4" />
              복사됨
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              클립보드 복사
            </>
          )}
        </Button>
      </div>

      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">useWindowSize</h3>
        <p className="text-sm">현재 창 크기: {width}x{height}px</p>
        <p className="text-xs text-muted-foreground mt-1">
          창을 resize 하면 실시간으로 업데이트됩니다
        </p>
      </div>

      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">useToggle</h3>
        <Button onClick={toggle} variant="outline">
          {isToggled ? '켜짐' : '꺼짐'}
        </Button>
      </div>

      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">useDarkMode</h3>
        <p className="text-sm">다크모드: {isDarkMode ? '활성' : '비활성'}</p>
      </div>
    </div>
  )
}`,
  },

  {
    slug: 'data-fetching',
    title: '데이터 패칭',
    description: 'Next.js fetch와 클라이언트 fetch로 데이터 가져오기',
    tags: ['Server Component', 'Client Fetch', 'Loading State'],
    icon: Database,
    category: 'data-fetching',
    code: `// 서버 컴포넌트 - 빌드/요청 시점에 fetch
async function ServerFetchDemo() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3')
    const posts = await res.json()
    return (
      <div className="space-y-2">
        {posts.map((post: any) => (
          <div key={post.id} className="p-3 border rounded-lg">
            <h4 className="font-semibold text-sm">{post.title}</h4>
            <p className="text-xs text-muted-foreground">{post.body}</p>
          </div>
        ))}
      </div>
    )
  } catch (error) {
    return <p className="text-sm text-destructive">데이터를 불러올 수 없습니다</p>
  }
}

// 클라이언트 컴포넌트 - 클릭/이벤트 시 fetch
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function ClientFetchDemo() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/users?_limit=3')
      const users = await res.json()
      setData(users)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={fetchData} disabled={loading}>
        {loading ? '로딩 중...' : '데이터 불러오기'}
      </Button>
      <div className="space-y-2">
        {loading && (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        )}
        {data.map((user) => (
          <div key={user.id} className="p-3 border rounded-lg">
            <p className="font-semibold text-sm">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  )
}`,
  },

  {
    slug: 'theming-and-dark-mode',
    title: '테마 및 다크모드',
    description: '다크모드 토글과 oklch 색상 변수로 테마 커스터마이징',
    tags: ['Dark Mode', 'next-themes', 'CSS Variables', 'oklch'],
    icon: Moon,
    category: 'theming',
    code: `import { ThemeToggle } from '@/components/layout/theme-toggle'

export function ThemingDemo() {
  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-4">다크모드 토글</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm">테마 전환:</span>
          <ThemeToggle />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          라이트/다크/시스템 테마를 자유롭게 전환하세요
        </p>
      </div>

      <div className="p-4 border rounded-lg space-y-3">
        <h3 className="font-semibold">CSS 변수 커스터마이징</h3>
        <p className="text-sm text-muted-foreground">
          src/app/globals.css 의 @theme inline 에서 oklch 변수를 수정하면 앱 전체 색상이 바뀝니다.
        </p>
        <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{
\`:root {
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.512 0.059 330.81);
  /* ... 다른 색상들 ... */
}

.dark {
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  /* ... */
}\`
}
        </pre>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="h-20 bg-primary rounded-lg flex items-end justify-center p-2">
          <span className="text-xs text-primary-foreground">Primary</span>
        </div>
        <div className="h-20 bg-secondary rounded-lg flex items-end justify-center p-2">
          <span className="text-xs text-secondary-foreground">Secondary</span>
        </div>
        <div className="h-20 bg-muted rounded-lg flex items-end justify-center p-2">
          <span className="text-xs text-muted-foreground">Muted</span>
        </div>
        <div className="h-20 bg-destructive rounded-lg flex items-end justify-center p-2">
          <span className="text-xs text-destructive-foreground">Destructive</span>
        </div>
      </div>
    </div>
  )
}`,
  },
]

export function getExampleBySlug(slug: string) {
  return examples.find((e) => e.slug === slug)
}
