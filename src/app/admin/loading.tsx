/**
 * 관리자 페이지 로딩 UI
 * 견적서 목록 테이블 형태의 스켈레톤을 표시합니다.
 */

import { Container } from '@/components/layout/container';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <Container className='py-8'>
      <div className='space-y-4'>
        {/* 테이블 헤더 스켈레톤 */}
        <div className='flex items-center gap-4 border-b border-border pb-3'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-16 ml-auto' />
        </div>

        {/* 테이블 행 스켈레톤 */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-center gap-4 py-3'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-6 w-16 rounded-full' />
            <Skeleton className='h-8 w-16 ml-auto rounded-md' />
          </div>
        ))}
      </div>
    </Container>
  );
}
