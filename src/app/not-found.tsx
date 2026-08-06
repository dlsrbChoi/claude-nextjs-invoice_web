'use client';

import { AlertCircle, Home, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center py-20 md:py-24 px-4'>
      {/* 아이콘 */}
      <div className='mb-6'>
        <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10'>
          <AlertCircle className='h-8 w-8 text-destructive' />
        </div>
      </div>

      {/* 제목 */}
      <h1 className='text-3xl md:text-4xl font-bold mb-3 text-center'>견적서를 찾을 수 없습니다</h1>

      {/* 설명 */}
      <p className='text-muted-foreground text-center mb-8 max-w-md leading-relaxed'>
        요청하신 Notion 페이지 ID가 존재하지 않거나 접근 권한이 없습니다.
      </p>

      {/* 도움말 카드 */}
      <Card className='p-5 mb-8 w-full max-w-md border-muted bg-muted/50'>
        <div className='space-y-3'>
          <div className='flex gap-3'>
            <HelpCircle className='h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5' />
            <div className='text-sm space-y-2'>
              <p className='font-semibold text-foreground'>다음을 확인해주세요:</p>
              <ul className='list-disc list-inside text-muted-foreground space-y-1'>
                <li>URL의 Notion 페이지 ID가 정확한지 확인하세요</li>
                <li>Notion 페이지가 실제로 존재하는지 확인하세요</li>
                <li>Integration이 해당 페이지에 접근할 권한이 있는지 확인하세요</li>
              </ul>
              <p className='pt-2 font-medium'>발행자에게 올바른 링크를 요청해주세요.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 액션 버튼 */}
      <Link href='/'>
        <Button className='gap-2'>
          <Home className='h-4 w-4' />
          홈으로 돌아가기
        </Button>
      </Link>
    </div>
  );
}
