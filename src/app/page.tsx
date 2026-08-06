/**
 * 홈페이지
 * 견적서 URL을 입력받아 조회하는 페이지
 */

import { Container } from '@/components/layout/container'
import { InvoiceLookup } from '@/components/invoice/invoice-lookup'
import { PageHeader } from '@/components/patterns/page-header'

export const metadata = {
  title: '견적서 조회 - 노션 기반 견적서 관리 시스템',
  description: '노션 견적서 링크를 통해 작성하신 견적서를 조회하고 PDF로 다운로드할 수 있습니다.',
}

export default function Home() {
  return (
    <>
      <PageHeader
        title="견적서 조회"
        description="노션 견적서 링크를 통해 작성하신 견적서를 조회하고 PDF로 다운로드할 수 있습니다."
      />
      <Container>
        <InvoiceLookup />
      </Container>
    </>
  )
}
