'use client'

import { useCounter, useToggle, useLocalStorage, useCopyToClipboard, useWindowSize, useDarkMode } from 'usehooks-ts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Copy, Minus, Plus } from 'lucide-react'

export function UseHooksTsDemo() {
  const { count, increment, decrement, reset } = useCounter(0)
  const [isToggled, toggle] = useToggle(false)
  const [saved, setSaved] = useLocalStorage('demo-value', 'Type here')
  const [copiedText, copy] = useCopyToClipboard()
  const { width, height } = useWindowSize()
  const { isDarkMode } = useDarkMode()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">useCounter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            카운터: <span className="font-bold text-lg">{count}</span>
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={decrement}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={increment}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={reset}>
              리셋
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">useToggle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            상태: <span className="font-semibold">{isToggled ? '켜짐' : '꺼짐'}</span>
          </p>
          <Button
            variant={isToggled ? 'default' : 'outline'}
            onClick={toggle}
            className="w-full"
          >
            {isToggled ? '꺼짐' : '켜기'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">useLocalStorage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="local-storage">값 입력 (로컬스토리지에 저장)</Label>
            <Input
              id="local-storage"
              value={saved}
              onChange={(e) => setSaved(e.target.value)}
              placeholder="입력하면 저장됩니다"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            💡 페이지를 새로고침하거나 탭을 닫았다가 다시 열어도 값이 유지됩니다
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">useCopyToClipboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => copy('https://github.com')}
            variant="outline"
            className="gap-2"
          >
            {copiedText === 'https://github.com' ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                복사됨!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                링크 복사
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            버튼을 클릭하면 클립보드에 URL이 복사됩니다
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">useWindowSize</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              창 너비: <span className="font-semibold text-foreground">{width}px</span>
            </p>
            <p className="text-sm text-muted-foreground">
              창 높이: <span className="font-semibold text-foreground">{height}px</span>
            </p>
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded text-xs text-muted-foreground">
            창을 resize하면 실시간으로 크기가 업데이트됩니다
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">useDarkMode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            다크모드: <span className="font-semibold text-foreground">{isDarkMode ? '활성' : '비활성'}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            헤더의 테마 토글을 클릭하면 다크모드가 전환되고 이 값이 업데이트됩니다
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
