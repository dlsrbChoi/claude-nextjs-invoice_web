/**
 * 견적서 조회 페이지
 * Notion 페이지 ID를 통해 견적서 정보를 조회하고 표시합니다.
 */

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getInvoiceFromNotion, normalizeNotionPageId, NotionAPIError, NotionPageNotFoundError } from '@/lib/notion'
import { PageHeader } from '@/components/patterns/page-header'
import { Container } from '@/components/layout/container'
import { InvoiceDetail } from '@/components/invoice/invoice-detail'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
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
      openGraph: {
        title: invoice.title,
        description: `${invoice.clientName}님 견적서`,
        type: 'website',
      },
    }
  } catch {
    // 메타데이터 생성 실패해도 페이지는 계속 렌더링됨 (에러 페이지에서 처리)
    return {
      title: '견적서 조회 - 견적서 관리 시스템',
      description: '견적서를 조회하는 페이지입니다.',
    }
  }
}

/**
 * Notion API에서 견적서를 로드하는 함수
 * 구체적인 에러 타입을 반환하여 페이지에서 적절한 처리 가능
 */
async function loadInvoice(notionPageId: string): Promise<{
  invoice: import('@/lib/types').Invoice | null
  error: string | null
  errorType: 'not-found' | 'invalid-id' | 'api-error' | null
}> {
  try {
    const normalizedId = normalizeNotionPageId(notionPageId)
    const invoice = await getInvoiceFromNotion(normalizedId)
    return { invoice, error: null, errorType: null }
  } catch (err) {
    // 구체적인 에러 타입 식별
    let errorType: 'not-found' | 'invalid-id' | 'api-error' = 'api-error'
    let errorMessage = '알 수 없는 오류가 발생했습니다'

    if (err instanceof NotionPageNotFoundError) {
      errorType = 'not-found'
      errorMessage = err.message
    } else if (err instanceof NotionAPIError) {
      errorType = 'api-error'
      errorMessage = err.message
    } else if (err instanceof Error) {
      errorMessage = err.message
    }

    return { invoice: null, error: errorMessage, errorType }
  }
}

/**
 * 견적서 상세 컴포넌트 (Suspense 경계용 서버 컴포넌트)
 */
async function InvoiceDetailSection({ notionPageId }: { notionPageId: string }) {
  const { invoice, error, errorType } = await loadInvoice(notionPageId)

  if (error || !invoice) {
    if (errorType === 'not-found') {
      // 404 처리: not-found.tsx로 리다이렉트
      notFound()
    }

    // 기타 에러: 에러 UI 표시
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

/**
 * Suspense 폴백 컴포넌트: 로딩 상태 표시
 */
function InvoicePageLoading() {
  return (
    <>
      <div className="bg-muted/50 py-12 print:hidden">
        <Container>
          <Skeleton className="h-10 w-2/3 mb-2" />
          <Skeleton className="h-5 w-1/2" />
        </Container>
      </div>

      <Container className="py-8">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>
        </div>
      </Container>
    </>
  )
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { notionPageId } = await params

  return (
    <Suspense fallback={<InvoicePageLoading />}>
      <InvoiceDetailSection notionPageId={notionPageId} />
    </Suspense>
  )
}
