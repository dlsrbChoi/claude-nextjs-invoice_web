/**
 * 커서 기반 페이지네이션 UI 컴포넌트
 * 페이지 번호 대신 이전/다음 이동만 지원한다 (PaginationState 참고).
 * 순수 프레젠테이션 컴포넌트로 내부 상태를 갖지 않으며, 상태 관리는 사용하는 쪽에서 담당한다.
 */

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  /** 현재 위치 표시용 라벨 (예: "1페이지"). 생략 가능 */
  currentPageLabel?: string;
}

export function Pagination({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentPageLabel,
}: PaginationProps) {
  return (
    <div className='flex items-center justify-between gap-4'>
      <Button
        variant='outline'
        size='sm'
        onClick={onPrevious}
        disabled={!hasPrevious}
        aria-label='이전 페이지로 이동'
        className='gap-1.5'
      >
        <ChevronLeft className='h-4 w-4' />
        이전
      </Button>

      {currentPageLabel && (
        <span className='text-sm text-muted-foreground'>{currentPageLabel}</span>
      )}

      <Button
        variant='outline'
        size='sm'
        onClick={onNext}
        disabled={!hasNext}
        aria-label='다음 페이지로 이동'
        className='gap-1.5'
      >
        다음
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  );
}
