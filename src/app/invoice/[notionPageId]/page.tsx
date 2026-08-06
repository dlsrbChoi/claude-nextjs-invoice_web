/**
 * 견적서 조회 페이지
 * Notion 페이지 ID를 통해 견적서 정보를 조회하고 표시합니다.
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import {
  getInvoiceFromNotion,
  normalizeNotionPageId,
  NotionAPIError,
  NotionPageNotFoundError,
} from '@/lib/notion';
import { PageHeader } from '@/components/patterns/page-header';
import { Container } from '@/components/layout/container';
import { InvoiceDetail } from '@/components/invoice/invoice-detail';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Metadata } from 'next';

interface InvoicePageProps {
  params: Promise<{
    notionPageId: string;
  }>;
}

export async function generateMetadata({ params }: InvoicePageProps): Promise<Metadata> {
  try {
    const { notionPageId } = await params;
    const normalizedId = normalizeNotionPageId(notionPageId);
    const invoice = await getInvoiceFromNotion(normalizedId);

    return {
      title: `${invoice.title} - 견적서 관리 시스템`,
      description: `${invoice.clientName}님 견적서 (${invoice.issueDate})`,
      openGraph: {
        title: invoice.title,
        description: `${invoice.clientName}님 견적서`,
        type: 'website',
      },
    };
  } catch {
    // 메타데이터 생성 실패해도 페이지는 계속 렌더링됨 (에러 페이지에서 처리)
    return {
      title: '견적서 조회 - 견적서 관리 시스템',
      description: '견적서를 조회하는 페이지입니다.',
    };
  }
}

/**
 * Notion API에서 견적서를 로드하는 함수
 * 구체적인 에러 타입을 반환하여 페이지에서 적절한 처리 가능
 * 민감한 정보(API 키, 내부 스택)는 마스킹
 */
async function loadInvoice(notionPageId: string): Promise<{
  invoice: import('@/lib/types').Invoice | null;
  error: string | null;
  errorType: 'not-found' | 'invalid-id' | 'api-error' | null;
}> {
  try {
    const normalizedId = normalizeNotionPageId(notionPageId);
    const invoice = await getInvoiceFromNotion(normalizedId);
    return { invoice, error: null, errorType: null };
  } catch (err) {
    // 구체적인 에러 타입 식별
    let errorType: 'not-found' | 'invalid-id' | 'api-error' = 'api-error';
    let errorMessage = '견적서 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

    if (err instanceof NotionPageNotFoundError) {
      errorType = 'not-found';
      errorMessage = '요청하신 견적서를 찾을 수 없습니다.';
    } else if (err instanceof NotionAPIError) {
      errorType = 'api-error';
      // 민감한 정보 마스킹: API 키나 내부 상세 정보는 보여주지 않음
      if (err.message.includes('권한')) {
        errorMessage = '이 페이지에 접근할 수 있는 권한이 없습니다.';
      } else if (err.message.includes('타임아웃') || err.message.includes('timeout')) {
        errorMessage = 'Notion API 연결 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
      } else {
        errorMessage = '견적서 조회 중 오류가 발생했습니다.';
      }
    }

    // 개발 환경에서만 상세 에러 로깅
    if (process.env.NODE_ENV === 'development') {
      console.error('Invoice loading error:', err);
    }

    return { invoice: null, error: errorMessage, errorType };
  }
}

/**
 * 견적서 상세 컴포넌트 (Suspense 경계용 서버 컴포넌트)
 * 캐싱: 60초 동안 같은 견적서에 대한 중복 요청을 건너뜀
 * 사용자가 "새로고침"을 명시적으로 클릭하면 캐시 무효화
 */
async function InvoiceDetailSection({ notionPageId }: { notionPageId: string }) {
  const { invoice, error, errorType } = await loadInvoice(notionPageId);

  if (error || !invoice) {
    if (errorType === 'not-found') {
      // 404 처리: not-found.tsx로 리다이렉트
      notFound();
    }

    // 기타 API 에러: not-found.tsx로 처리
    // (사용자는 404 페이지 대신 에러 경계로 이동됨)
    if (errorType === 'api-error') {
      notFound();
    }

    // 검증 오류 (invalid-id): 에러 UI 표시
    return (
      <>
        <PageHeader title='잘못된 요청' description='요청하신 페이지 형식이 올바르지 않습니다' />
        <Container>
          <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4'>
            <p className='text-sm text-destructive'>{error}</p>
            <p className='text-xs text-muted-foreground mt-2'>
              Notion 페이지 ID는 32자 16진수, UUID 형식, 또는 Notion URL이어야 합니다.
            </p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageHeader title={invoice.title} description={`${invoice.clientName}님 견적서`} />
      <Container>
        <InvoiceDetail invoice={invoice} />
      </Container>
    </>
  );
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { notionPageId } = await params;

  return (
    <Suspense fallback={<InvoiceLoadingSkeleton />}>
      <InvoiceDetailSection notionPageId={notionPageId} />
    </Suspense>
  );
}

/**
 * Suspense 폴백 컴포넌트: 로딩 상태 표시
 * loading.tsx와 동일한 구조이며, Suspense 경계용으로 사용됩니다.
 */
function InvoiceLoadingSkeleton() {
  return (
    <div className='print:hidden'>
      {/* 페이지 헤더 스켈레톤 */}
      <div className='bg-muted/30 py-8 md:py-12'>
        <Container>
          <div className='space-y-2'>
            <Skeleton className='h-8 md:h-10 w-3/4' />
            <Skeleton className='h-5 w-1/2' />
          </div>
        </Container>
      </div>

      {/* 콘텐츠 영역 */}
      <Container className='py-8'>
        <div className='space-y-6'>
          {/* 헤더 카드 스켈레톤 */}
          <Card className='p-6'>
            <Skeleton className='h-7 w-3/4 mb-3' />
            <Skeleton className='h-4 w-1/2' />
          </Card>

          {/* 청구 대상 카드 스켈레톤 */}
          <Card className='p-6'>
            <Skeleton className='h-4 w-24 mb-4' />
            <div className='space-y-3'>
              <Skeleton className='h-5 w-2/3' />
              <Skeleton className='h-4 w-1/2' />
            </div>
          </Card>

          {/* 항목 카드 스켈레톤 */}
          <Card className='p-6'>
            <Skeleton className='h-4 w-16 mb-4' />
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='border border-border rounded-lg p-4 space-y-3'>
                  <Skeleton className='h-4 w-2/3' />
                  <div className='grid grid-cols-3 gap-2'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-full' />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 합계 카드 스켈레톤 */}
          <Card className='p-6 bg-muted/50'>
            <Skeleton className='h-4 w-16 mb-2' />
            <Skeleton className='h-8 w-48' />
          </Card>

          {/* 액션 버튼 스켈레톤 */}
          <Skeleton className='h-10 w-32' />
        </div>
      </Container>
    </div>
  );
}
