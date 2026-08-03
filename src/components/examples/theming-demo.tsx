'use client'

import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ThemingDemo() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">다크모드 토글</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">테마 전환:</span>
            <ThemeToggle />
          </div>
          <p className="text-xs text-muted-foreground">
            라이트 / 다크 / 시스템 테마를 자유롭게 전환할 수 있습니다.
            선택한 테마는 로컬스토리지에 자동으로 저장됩니다.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">CSS 변수 커스터마이징</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">src/app/globals.css</code>의 <code className="bg-muted px-1.5 py-0.5 rounded text-xs">@theme inline</code> 에서 oklch 변수를 수정하면 앱 전체 색상이 변합니다.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg overflow-x-auto">
            <pre className="text-xs font-mono text-muted-foreground">
{`:root {
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.512 0.059 330.81);
  /* ... */
}

.dark {
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  /* ... */
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">색상 팔레트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div className="space-y-2">
              <div className="h-20 bg-primary rounded-lg" />
              <p className="text-xs font-medium">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-secondary rounded-lg" />
              <p className="text-xs font-medium">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-muted rounded-lg" />
              <p className="text-xs font-medium">Muted</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-destructive rounded-lg" />
              <p className="text-xs font-medium">Destructive</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-border rounded-lg border border-muted-foreground" />
              <p className="text-xs font-medium">Border</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-ring rounded-lg" />
              <p className="text-xs font-medium">Ring</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-background rounded-lg border border-border" />
              <p className="text-xs font-medium">Background</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-foreground rounded-lg" />
              <p className="text-xs font-medium">Foreground</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">next-themes 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            이 프로젝트는 <code className="bg-muted px-1.5 py-0.5 rounded text-xs">next-themes</code>를 사용하여 다크모드를 구현합니다.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ 클라이언트-사이드 렌더링 시 깜빡임 없음</p>
            <p>✓ 라이트/다크/시스템 테마 자동 감지</p>
            <p>✓ 로컬스토리지에 사용자 선택사항 저장</p>
            <p>✓ CSS 클래스 기반으로 다크모드 적용</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
