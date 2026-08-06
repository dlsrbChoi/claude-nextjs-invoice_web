/**
 * 견적서 페이지 로딩 스켈레톤
 * Suspense 경계의 폴백 UI로 사용됩니다.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Container } from '@/components/layout/container';
import { Card } from '@/components/ui/card';

export default function InvoiceLoading() {
  return (
    <div className='print:hidden'>
      {/* 페이지 헤더 스켈레톤 */}
      <div className='py-8 md:py-12'>
        <Container>
          <Skeleton className='h-8 md:h-10 w-3/4 mb-3' />
          <Skeleton className='h-5 w-1/2' />
        </Container>
      </div>

      {/* 콘텐츠 영역 */}
      <Container className='pb-8'>
        <div className='space-y-6'>
          {/* 헤더 카드 스켈레톤 */}
          <Card className='p-6'>
            <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-7 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
              </div>
              <div className='hidden md:flex flex-col items-end gap-2'>
                <Skeleton className='h-6 w-20' />
                <Skeleton className='h-4 w-24' />
              </div>
            </div>
          </Card>

          {/* 청구 대상 카드 스켈레톤 */}
          <Card className='p-6'>
            <Skeleton className='h-4 w-24 mb-4' />
            <div className='space-y-3'>
              <Skeleton className='h-5 w-2/3' />
              <Skeleton className='h-4 w-1/2' />
            </div>
          </Card>

          {/* 항목 카드 스켈레톤 */}
          <Card className='p-6'>
            <Skeleton className='h-4 w-16 mb-4' />

            {/* 데스크톱 테이블 뷰 스켈레톤 */}
            <div className='hidden md:block space-y-3'>
              {/* 테이블 헤더 */}
              <div className='grid grid-cols-4 gap-4 pb-3 border-b border-border'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
              </div>
              {/* 테이블 행 */}
              {[1, 2, 3].map((i) => (
                <div key={i} className='grid grid-cols-4 gap-4'>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-3 w-3/4' />
                  </div>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-full' />
                </div>
              ))}
            </div>

            {/* 모바일 카드 뷰 스켈레톤 */}
            <div className='md:hidden space-y-3'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='border border-border rounded-lg p-4 space-y-3'>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-2/3' />
                    <Skeleton className='h-3 w-1/2' />
                  </div>
                  <div className='grid grid-cols-3 gap-2'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-full' />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 합계 카드 스켈레톤 */}
          <Card className='p-6 bg-muted/50'>
            <div className='space-y-4'>
              <Skeleton className='h-4 w-16 mb-2' />
              <Skeleton className='h-4 w-full' />
              <div className='flex justify-between items-end pt-2 border-t border-border'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-8 w-48' />
              </div>
            </div>
          </Card>

          {/* 액션 버튼 스켈레톤 */}
          <Skeleton className='h-10 w-32' />
        </div>
      </Container>
    </div>
  );
}
