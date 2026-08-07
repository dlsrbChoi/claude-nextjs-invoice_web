/**
 * 관리자 페이지 - 견적서 목록
 * 현재는 정적 껍데기만 구현 (추후 Notion 데이터베이스 목록 조회 연동 예정)
 */

import { Container } from '@/components/layout/container';
import { PageHeader } from '@/components/patterns/page-header';

export const metadata = {
  title: '견적서 관리 - 노션 기반 견적서 관리 시스템',
  description: '발행된 견적서 목록을 조회하고 관리합니다.',
};

export default function AdminPage() {
  return (
    <>
      <PageHeader title='견적서 관리' description='발행된 견적서 목록을 조회하고 관리합니다.' />
      <Container className='py-8'>
        {/* TODO: 견적서 목록 테이블 구현 (Notion 데이터베이스 연동) */}
        <p className='text-sm text-muted-foreground'>견적서 목록 기능은 준비 중입니다.</p>
      </Container>
    </>
  );
}
