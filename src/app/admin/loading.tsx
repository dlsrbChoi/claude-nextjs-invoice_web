/**
 * 관리자 대시보드 로딩 UI
 * 통계 카드 + 최근 활동 목록 형태의 스켈레톤을 표시합니다.
 */

import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardLoading() {
  return (
    <div className='space-y-6 px-4 py-8 md:px-6'>
      {/* 통계 카드 스켈레톤 */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className='h-24 rounded-lg' />
        ))}
      </div>

      {/* 최근 활동 스켈레톤 */}
      <div className='space-y-3'>
        <Skeleton className='h-5 w-32' />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className='h-12 w-full rounded-md' />
        ))}
      </div>
    </div>
  );
}
