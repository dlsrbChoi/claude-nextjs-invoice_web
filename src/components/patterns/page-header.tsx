/**
 * 페이지 헤더 패턴 컴포넌트
 * 각 페이지의 제목과 설명을 표시하는 일관된 레이아웃을 제공합니다.
 */

import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** 내부 컨텐츠 폭 오버라이드 (기본 max-w-4xl). 관리자 화면처럼 더 넓은 폭이 필요할 때 사용 */
  contentClassName?: string;
}

export function PageHeader({ title, description, contentClassName }: PageHeaderProps) {
  return (
    <div className='bg-muted/30 py-8 md:py-12 lg:py-16 print:hidden'>
      <div className={cn('mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8', contentClassName)}>
        <h1 className='text-3xl md:text-4xl font-bold mb-2'>{title}</h1>
        {description && (
          <p className='text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed'>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
