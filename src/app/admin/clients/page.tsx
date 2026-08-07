/**
 * 클라이언트 목록 (F030 부속, Task 609)
 * 더미 데이터(mock-data.ts)로 UI를 완성한다. 실데이터 연동은 향후 Task에서 처리한다.
 */

import { Users } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/patterns/empty-state';
import { ClientListTable } from '@/components/invoice/client-list-table';
import { mockClients } from '@/lib/mock-data';

export const metadata = {
  title: '클라이언트 - 노션 기반 견적서 관리 시스템',
  description: '견적서를 발행한 클라이언트 목록을 조회합니다.',
};

export default function AdminClientsPage() {
  return (
    <>
      <PageHeader
        title='클라이언트'
        description='견적서를 발행한 클라이언트 목록입니다.'
        contentClassName='max-w-none'
      />
      <Container className='max-w-none py-8'>
        {mockClients.length === 0 ? (
          <EmptyState
            icon={Users}
            title='등록된 클라이언트가 없습니다'
            description='견적서가 발행되면 클라이언트 목록이 이곳에 표시됩니다.'
          />
        ) : (
          <div className='space-y-4'>
            <p className='text-sm text-muted-foreground'>총 {mockClients.length}명의 클라이언트</p>
            <ClientListTable clients={mockClients} />
          </div>
        )}
      </Container>
    </>
  );
}
