'use client';

/**
 * 견적서 목록 페이지네이션 (F034, Task 610)
 * Task 612: Notion 커서 기반 페이지네이션 구현
 *
 * 커서 기반 페이지네이션:
 * - URL searchParams에서 커서와 이전 커서 스택을 읽음
 * - "다음" 클릭 시 현재 커서를 스택에 추가하고 nextCursor로 이동
 * - "이전" 클릭 시 스택에서 pop하여 그 값으로 이동
 * - 페이지 새로고침·공유 시 커서 스택이 URL에 보존됨
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { Pagination } from '@/components/patterns/pagination';

interface InvoiceListPaginationProps {
  hasMore: boolean;
  /** 현재 페이지의 Notion cursor (첫 페이지는 undefined) */
  currentCursor?: string;
  /** 다음 페이지의 Notion cursor */
  nextCursor?: string;
  /** 이전 페이지로 갈 수 있는 커서들의 스택 (스택의 마지막이 "이전" 버튼의 목표) */
  prevCursors: (string | undefined)[];
}

export function InvoiceListPagination({
  hasMore,
  currentCursor,
  nextCursor,
  prevCursors,
}: InvoiceListPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNext = () => {
    if (!hasMore || !nextCursor) return;

    // 새로운 prevCursors: 현재 cursor를 스택에 추가
    const newPrevCursors = [...prevCursors, currentCursor];

    // URL 업데이트
    const params = new URLSearchParams(searchParams);
    params.set('cursor', nextCursor);
    params.set('prevCursors', JSON.stringify(newPrevCursors));

    router.push(`?${params.toString()}`);
  };

  const handlePrevious = () => {
    if (prevCursors.length === 0) return;

    // 스택에서 pop
    const newPrevCursors = [...prevCursors];
    const prevCursor = newPrevCursors.pop();

    // URL 업데이트
    const params = new URLSearchParams(searchParams);
    if (prevCursor === undefined) {
      // 첫 페이지로 돌아감: cursor 제거
      params.delete('cursor');
    } else {
      params.set('cursor', prevCursor);
    }
    params.set('prevCursors', JSON.stringify(newPrevCursors));

    router.push(`?${params.toString()}`);
  };

  const currentPageNumber = prevCursors.length + 1;

  return (
    <Pagination
      currentPageLabel={`${currentPageNumber}페이지`}
      hasPrevious={prevCursors.length > 0}
      hasNext={hasMore}
      onPrevious={handlePrevious}
      onNext={handleNext}
    />
  );
}
