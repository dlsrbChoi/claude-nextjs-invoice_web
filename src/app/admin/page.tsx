/**
 * 관리자 페이지 - 견적서 목록
 * Notion 데이터베이스에서 조회한 견적서 목록 표시
 */

import { Container } from '@/components/layout/container';
import { PageHeader } from '@/components/patterns/page-header';
import { InvoiceListTable } from '@/components/invoice/invoice-list-table';
import { getInvoiceListFromNotion } from '@/lib/notion';

export const metadata = {
  title: '견적서 관리 - 노션 기반 견적서 관리 시스템',
  description: '발행된 견적서 목록을 조회하고 관리합니다.',
};

export default async function AdminPage() {
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    return (
      <>
        <PageHeader title='견적서 관리' description='발행된 견적서 목록을 조회하고 관리합니다.' />
        <Container className='py-8'>
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

  let result: Awaited<ReturnType<typeof getInvoiceListFromNotion>> | null = null;
  let error: Error | null = null;

  try {
    result = await getInvoiceListFromNotion(databaseId, { pageSize: 50 });
  } catch (err) {
    console.error('관리자 페이지 로드 오류:', err);
    error = err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다');
  }

  if (error) {
    return (
      <>
        <PageHeader title='견적서 관리' description='발행된 견적서 목록을 조회하고 관리합니다.' />
        <Container className='py-8'>
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
      <PageHeader title='견적서 관리' description='발행된 견적서 목록을 조회하고 관리합니다.' />
      <Container className='py-8'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                총 {result?.invoices.length || 0}개의 견적서
              </p>
            </div>
          </div>
          <InvoiceListTable invoices={result?.invoices || []} />
        </div>
      </Container>
    </>
  );
}
