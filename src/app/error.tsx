'use client';

/**
 * 글로벌 에러 페이지
 * 예기치 않은 에러 발생 시 사용자 친화적인 UI를 표시합니다.
 */

import { useEffect } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 에러를 콘솔에 기록 (실제 환경에서는 에러 추적 서비스로 전송)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className='flex flex-col items-center justify-center py-16 md:py-24 px-4'>
      {/* 아이콘 */}
      <div className='mb-6'>
        <div className='inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-destructive/10'>
          <AlertTriangle className='h-8 md:h-10 w-8 md:w-10 text-destructive' />
        </div>
      </div>

      {/* 제목 */}
      <h1 className='text-3xl md:text-4xl font-bold mb-3 text-center'>오류가 발생했습니다</h1>

      {/* 설명 */}
      <p className='text-muted-foreground text-center mb-8 max-w-md leading-relaxed'>
        죄송합니다. 견적서를 불러오는 중에 예기치 않은 문제가 발생했습니다. 다시 시도하거나 처음
        페이지로 돌아가주세요.
      </p>

      {/* 에러 정보 카드 (개발 환경) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className='p-4 mb-8 w-full max-w-md bg-muted/50 border-muted'>
          <p className='text-xs font-mono text-muted-foreground break-all'>
            {error.message || '알 수 없는 오류'}
          </p>
        </Card>
      )}

      {/* 액션 버튼 */}
      <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
        <Button onClick={() => reset()} className='gap-2 flex-1 sm:flex-none' variant='default'>
          <RotateCcw className='h-4 w-4' />
          다시 시도
        </Button>
        <Link href='/' className='flex-1 sm:flex-none'>
          <Button variant='outline' className='w-full gap-2'>
            <Home className='h-4 w-4' />
            처음으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}
