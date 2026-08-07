/**
 * 관리자 페이지 - 견적서 목록
 * Notion 데이터베이스에서 조회한 견적서 목록 표시
 *
 * v2.0에서는 이 화면이 `/admin`이었으나, v3.0에서 `/admin`이 대시보드로
 * 재정의되면서 이 경로(`/admin/invoices`)로 이관되었다 (Task 603).
 *
 * Task 612: URL searchParams에서 커서 읽고 페이지네이션 연동
 * - cursor: 현재 페이지 조회에 사용된 커서
 * - prevCursors: 이전 페이지로 갈 수 있는 커서들의 스택 (JSON)
 */

import { Container } from '@/components/layout/container';
import { PageHeader } from '@/components/patterns/page-header';
import { InvoiceListTable } from '@/components/invoice/invoice-list-table';
import { InvoiceListPagination } from '@/components/invoice/invoice-list-pagination';
import { getInvoiceListFromNotion } from '@/lib/notion';

export const metadata = {
  title: '견적서 관리 - 노션 기반 견적서 관리 시스템',
  description: '발행된 견적서 목록을 조회하고 관리합니다.',
};

interface AdminInvoicesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminInvoicesPage({ searchParams }: AdminInvoicesPageProps) {
  const params = await searchParams;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    return (
      <>
        <PageHeader
          title='견적서 관리'
          description='발행된 견적서 목록을 조회하고 관리합니다.'
          contentClassName='max-w-none'
        />
        <Container className='max-w-none py-8'>
          <div className='bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm'>
            <p className='font-medium text-destructive'>설정 오류</p>
            <p className='text-destructive/90 mt-1'>
              NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.
            </p>
          </div>
        </Container>
      </>
    );
  }

  // URL에서 커서 및 이전 커서 스택 파싱
  const cursor = typeof params.cursor === 'string' ? params.cursor : undefined;
  let prevCursors: (string | undefined)[] = [];
  try {
    const prevCursorsRaw = typeof params.prevCursors === 'string' ? params.prevCursors : undefined;
    if (prevCursorsRaw) {
      prevCursors = JSON.parse(prevCursorsRaw);
    }
  } catch (err) {
    console.warn('prevCursors 파싱 오류:', err);
    prevCursors = [];
  }

  let result: Awaited<ReturnType<typeof getInvoiceListFromNotion>> | null = null;
  let error: Error | null = null;

  try {
    result = await getInvoiceListFromNotion(databaseId, {
      startCursor: cursor,
      pageSize: 25, // 한 페이지에 25건
    });
  } catch (err) {
    console.error('관리자 페이지 로드 오류:', err);
    error = err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다');
  }

  if (error) {
    return (
      <>
        <PageHeader
          title='견적서 관리'
          description='발행된 견적서 목록을 조회하고 관리합니다.'
          contentClassName='max-w-none'
        />
        <Container className='max-w-none py-8'>
          <div className='bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm'>
            <p className='font-medium text-destructive'>조회 오류</p>
            <p className='text-destructive/90 mt-1'>{error.message}</p>
            <p className='text-destructive/70 mt-2 text-xs'>
              Notion 데이터베이스 설정을 확인하고 페이지를 새로고침하세요.
            </p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title='견적서 관리'
        description='발행된 견적서 목록을 조회하고 관리합니다.'
        contentClassName='max-w-none'
      />
      <Container className='max-w-none py-8'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                {result?.invoices.length || 0}개의 견적서
              </p>
            </div>
          </div>
          <InvoiceListTable invoices={result?.invoices || []} />
          <InvoiceListPagination
            hasMore={result?.hasMore ?? false}
            currentCursor={cursor}
            nextCursor={result?.nextCursor}
            prevCursors={prevCursors}
          />
        </div>
      </Container>
    </>
  );
}
