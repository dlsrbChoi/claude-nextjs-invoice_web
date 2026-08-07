/**
 * 신고 관리 (F035)
 * 더미 데이터(mockReports) 기반 신고 목록/상세/처리 UI (Task 611)
 * 실데이터 연동은 Task 614에서 처리한다.
 */

import { PageHeader } from '@/components/patterns/page-header';
import { Container } from '@/components/layout/container';
import { ReportsPanel } from '@/components/admin/reports-panel';

export const metadata = {
  title: '신고 관리 - 노션 기반 견적서 관리 시스템',
  description: '접수된 신고를 조회하고 처리합니다.',
};

export default function AdminReportsPage() {
  return (
    <>
      <PageHeader
        title='신고 관리'
        description='접수된 신고를 조회하고 처리합니다.'
        contentClassName='max-w-none'
      />
      <Container className='max-w-none py-8'>
        <ReportsPanel />
      </Container>
    </>
  );
}
