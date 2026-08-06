'use client';

/**
 * 견적서 페이지 404 에러 UI
 * 존재하지 않는 견적서를 요청했을 때 표시됩니다.
 */

import { AlertCircle, Home, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function InvoiceNotFound() {
  return (
    <div className='flex flex-col items-center justify-center py-16 md:py-24 px-4'>
      {/* 아이콘 */}
      <div className='mb-6'>
        <div className='inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted/50'>
          <AlertCircle className='h-8 md:h-10 w-8 md:w-10 text-muted-foreground' />
        </div>
      </div>

      {/* 제목 */}
      <h1 className='text-3xl md:text-4xl font-bold mb-3 text-center'>견적서를 찾을 수 없습니다</h1>

      {/* 설명 */}
      <p className='text-muted-foreground text-center mb-8 max-w-md leading-relaxed'>
        요청하신 견적서가 존재하지 않거나 접근할 수 없습니다. 올바른 링크를 사용하고 있는지 다시
        확인해주세요.
      </p>

      {/* 도움말 카드 */}
      <Card className='p-6 mb-8 w-full max-w-md bg-muted/30 border-muted'>
        <div className='flex gap-4'>
          <HelpCircle className='h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5' />
          <div className='text-sm'>
            <p className='font-semibold mb-1'>발행자에게 문의하세요</p>
            <p className='text-xs text-muted-foreground'>
              올바른 견적서 링크나 페이지 ID를 발행자로부터 받았는지 확인해주세요.
            </p>
          </div>
        </div>
      </Card>

      {/* 액션 버튼 */}
      <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
        <Link href='/' className='flex-1 sm:flex-none'>
          <Button className='w-full gap-2' variant='default'>
            <Home className='h-4 w-4' />
            처음으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}
