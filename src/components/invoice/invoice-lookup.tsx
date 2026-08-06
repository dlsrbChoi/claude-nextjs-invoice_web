'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { normalizeNotionPageId, NotionInvalidPageIdError } from '@/lib/notion'
import { AlertCircle, ArrowRight } from 'lucide-react'

export function InvoiceLookup() {
  const router = useRouter()
  const [pageId, setPageId] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Notion 페이지 ID 유효성 검증 및 정규화
      const normalizedId = normalizeNotionPageId(pageId.trim())

      // 견적서 페이지로 이동
      router.push(`/invoice/${normalizedId}`)
    } catch (err) {
      let message = '유효하지 않은 URL입니다'

      if (err instanceof NotionInvalidPageIdError) {
        message = err.message
      } else if (err instanceof Error) {
        message = err.message
      }

      setError(message)
      setIsLoading(false)
    }
  }

  const handleExtractPageId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()

    // Notion URL에서 페이지 ID 추출
    // 예: https://www.notion.so/My-Database-123456789?v=xyz -> 123456789
    // 또는 직접 페이지 ID 입력 가능
    if (value.includes('notion.so')) {
      // Notion URL에서 32자 16진수 ID 추출
      const match = value.match(/notion\.so\/[^?]*-([a-f0-9]{32})/i)
      if (match && match[1]) {
        setPageId(match[1])
      } else {
        setPageId(value)
      }
    } else {
      setPageId(value)
    }
    setError('')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pageId" className="block text-sm font-medium mb-2">
              Notion 견적서 링크 또는 페이지 ID
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              다음 중 하나를 입력하세요:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 mb-3">
              <li>• Notion 페이지 URL: https://www.notion.so/...</li>
              <li>• 페이지 ID (32자 16진수): a1b2c3d4e5f6g7h8...</li>
            </ul>
            <Input
              id="pageId"
              type="text"
              placeholder="Notion 페이지 ID 또는 URL을 입력하세요"
              value={pageId}
              onChange={handleExtractPageId}
              disabled={isLoading}
              className="font-mono text-sm"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !pageId}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span> 조회 중...
              </>
            ) : (
              <>
                견적서 조회
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-8 border-t border-border">
          <h3 className="text-sm font-semibold mb-3">사용 방법</h3>
          <ol className="text-sm text-muted-foreground space-y-2">
            <li className="flex gap-2">
              <span className="font-medium text-foreground">1.</span>
              <span>Notion 견적서 페이지의 URL을 복사하거나 페이지 ID를 입력합니다</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-foreground">2.</span>
              <span>&quot;견적서 조회&quot; 버튼을 클릭합니다</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-foreground">3.</span>
              <span>견적서 상세 정보를 확인하고 PDF로 다운로드할 수 있습니다</span>
            </li>
          </ol>
        </div>
      </Card>
    </div>
  )
}
