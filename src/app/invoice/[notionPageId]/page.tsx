/**
 * 견적서 조회 페이지
 * Notion 페이지 ID를 통해 견적서 정보를 조회하고 표시합니다.
 */

import { getInvoiceFromNotion, normalizeNotionPageId } from '@/lib/notion'
import { PageHeader } from '@/components/patterns/page-header'
import { Container } from '@/components/layout/container'
import { InvoiceDetail } from '@/components/invoice/invoice-detail'
import { Metadata } from 'next'

interface InvoicePageProps {
  params: Promise<{
    notionPageId: string
  }>
}

export async function generateMetadata({ params }: InvoicePageProps): Promise<Metadata> {
  try {
    const { notionPageId } = await params
    const normalizedId = normalizeNotionPageId(notionPageId)
    const invoice = await getInvoiceFromNotion(normalizedId)

    return {
      title: `${invoice.title} - 견적서 관리 시스템`,
      description: `${invoice.clientName}님 견적서 (${invoice.issueDate})`,
    }
  } catch {
    return {
      title: '견적서 조회 - 견적서 관리 시스템',
      description: '견적서를 조회하는 페이지입니다.',
    }
  }
}

async function loadInvoice(notionPageId: string) {
  try {
    const normalizedId = normalizeNotionPageId(notionPageId)
    const invoice = await getInvoiceFromNotion(normalizedId)
    return { invoice: invoice, error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다'
    return { invoice: null, error: errorMessage }
  }
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { notionPageId } = await params
  const { invoice, error } = await loadInvoice(notionPageId)

  if (error || !invoice) {
    return (
      <>
        <PageHeader
          title="견적서 조회 실패"
          description="요청하신 견적서를 불러올 수 없습니다"
        />
        <Container>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </Container>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={invoice.title}
        description={`${invoice.clientName}님 견적서`}
      />
      <Container>
        <InvoiceDetail invoice={invoice} />
      </Container>
    </>
  )
}
