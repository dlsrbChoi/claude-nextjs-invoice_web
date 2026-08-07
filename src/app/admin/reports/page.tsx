/**
 * 신고 관리 (F035, Task 614)
 * Notion Reports 데이터베이스의 실제 신고 데이터 조회
 * 페이지네이션 지원 (커서 기반)
 */

import { Suspense } from 'react';
import { PageHeader } from '@/components/patterns/page-header';
import { Container } from '@/components/layout/container';
import { ReportsPanel } from '@/components/admin/reports-panel';
import { ReportsPanelSkeleton } from '@/components/admin/reports-panel-skeleton';

export const metadata = {
  title: '신고 관리 - 노션 기반 견적서 관리 시스템',
  description: '접수된 신고를 조회하고 처리합니다.',
};

/**
 * searchParams에서 커서 파라미터 추출
 * Task 614: 페이지네이션 커서 기반 조회
 */
export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  return (
    <>
      <PageHeader
        title='신고 관리'
        description='접수된 신고를 조회하고 처리합니다.'
        contentClassName='max-w-none'
      />
      <Container className='max-w-none py-8'>
        <Suspense fallback={<ReportsPanelSkeleton />}>
          <ReportsPanelData searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}

/**
 * 에러 알림 컴포넌트 (try/catch 외부에서 사용)
 */
function ErrorAlert({ message }: { message: string }) {
  return (
    <div className='rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive'>
      <strong>데이터 조회 실패:</strong> {message}
      <br />
      <small>Notion Integration 권한을 확인하고 이후 다시 시도해주세요.</small>
    </div>
  );
}

/**
 * 실제 데이터 로드 및 렌더링 (서버 컴포넌트)
 * 환경 변수 검증은 try/catch 외부에서 처리
 */
async function ReportsPanelData({ searchParams }: { searchParams: Promise<{ cursor?: string }> }) {
  const { cursor } = await searchParams;

  // Notion 신고 데이터 조회
  const { getReportListFromNotion } = await import('@/lib/notion');
  const reportsDbId = process.env.NOTION_REPORTS_DATABASE_ID;

  // 환경 변수 확인 (try/catch 외부에서)
  if (!reportsDbId) {
    return <ErrorAlert message='NOTION_REPORTS_DATABASE_ID가 설정되지 않았습니다.' />;
  }

  let reports;
  let hasMore = false;
  let nextCursor: string | undefined;
  let error: Error | null = null;

  try {
    const result = await getReportListFromNotion(reportsDbId, {
      startCursor: cursor,
      pageSize: 25,
    });
    reports = result.reports;
    hasMore = result.hasMore;
    nextCursor = result.nextCursor;
  } catch (err) {
    error = err instanceof Error ? err : new Error('신고 데이터를 조회할 수 없습니다');
    console.error('신고 목록 조회 실패:', error.message);
  }

  // try/catch 외부에서 JSX 렌더링
  if (error) {
    return <ErrorAlert message={error.message} />;
  }

  if (!reports) {
    return <ErrorAlert message='신고 데이터를 조회할 수 없습니다.' />;
  }

  // 기본 위치 정보 (페이지네이션용)
  const paginationInfo = {
    hasMore,
    nextCursor,
    currentCursor: cursor,
  };

  return <ReportsPanel initialReports={reports} pagination={paginationInfo} />;
}
