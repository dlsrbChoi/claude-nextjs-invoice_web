/**
 * 신고 관리 패널 로딩 스켈레톤 (Task 614)
 * ReportsPanel이 로드되는 동안 표시되는 플레이스홀더
 */

import { Skeleton } from '@/components/ui/skeleton';

export function ReportsPanelSkeleton() {
  return (
    <div className='space-y-4'>
      {/* 탭 헤더 스켈레톤 */}
      <div className='flex gap-2'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-10 w-24 rounded-md' />
        ))}
      </div>

      {/* 데스크톱 테이블 스켈레톤 */}
      <div className='hidden md:block space-y-3'>
        {/* 테이블 헤더 */}
        <div className='grid grid-cols-6 gap-4 px-4 py-3 bg-muted/50 rounded-md'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className='h-4 w-20' />
          ))}
        </div>

        {/* 테이블 행 */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='grid grid-cols-6 gap-4 px-4 py-3 border-b'>
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton key={j} className='h-4 w-16' />
            ))}
          </div>
        ))}
      </div>

      {/* 모바일 카드 스켈레톤 */}
      <div className='md:hidden space-y-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='rounded-xl bg-card p-4 ring-1 ring-foreground/10 space-y-3'>
            <div className='flex items-start justify-between gap-2'>
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-3 w-1/2' />
              </div>
              <Skeleton className='h-6 w-16 rounded-full' />
            </div>
            <Skeleton className='h-4 w-full' />
            <div className='flex items-center justify-between border-t pt-3'>
              <Skeleton className='h-3 w-1/3' />
              <Skeleton className='h-8 w-20' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
