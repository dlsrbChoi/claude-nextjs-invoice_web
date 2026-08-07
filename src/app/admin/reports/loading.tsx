/**
 * 신고 관리 목록 로딩 UI
 */

import { Skeleton } from '@/components/ui/skeleton';

export default function AdminReportsLoading() {
  return (
    <div className='space-y-4 px-4 py-8 md:px-6'>
      <div className='flex items-center gap-4 border-b border-border pb-3'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-6 w-16 ml-auto rounded-full' />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className='flex items-center gap-4 py-3'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-6 w-16 ml-auto rounded-full' />
        </div>
      ))}
    </div>
  );
}
