'use client'

import { EmptyState } from '@/components/patterns/empty-state'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="py-20">
      <EmptyState
        icon={AlertCircle}
        title="페이지를 찾을 수 없습니다"
        description="요청하신 페이지가 존재하지 않습니다. 다시 확인하고 시도해주세요."
        action={{
          label: '홈으로 돌아가기',
          href: '/',
        }}
      />
    </div>
  )
}
