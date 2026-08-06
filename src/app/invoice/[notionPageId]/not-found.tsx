'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function InvoiceNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-semibold mb-2">견적서를 찾을 수 없습니다</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        요청하신 견적서가 존재하지 않거나 접근할 수 없습니다.
        <br />
        발행자에게 올바른 링크를 요청해주세요.
      </p>
      <Link href="/">
        <Button>처음으로 돌아가기</Button>
      </Link>
    </div>
  )
}
