'use client'

import { useEffect } from 'react'
import { EmptyState } from '@/components/patterns/empty-state'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="py-20">
      <div className="flex flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">오류가 발생했습니다</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-sm">
          죄송합니다. 문제가 발생했습니다. 다시 시도해주세요.
        </p>
        <Button onClick={() => reset()}>다시 시도</Button>
      </div>
    </div>
  )
}
