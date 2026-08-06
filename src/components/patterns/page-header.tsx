/**
 * 페이지 헤더 패턴 컴포넌트
 * 각 페이지의 제목과 설명을 표시하는 일관된 레이아웃을 제공합니다.
 */

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className='bg-muted/30 py-8 md:py-12 lg:py-16 print:hidden'>
      <div className='mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8'>
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
