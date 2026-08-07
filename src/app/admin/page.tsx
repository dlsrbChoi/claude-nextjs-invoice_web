/**
 * 관리자 대시보드 (F030)
 * v3.0에서 `/admin`은 견적서 목록 대신 대시보드로 재정의되었다 (Task 603).
 * 기존 견적서 목록 화면은 `/admin/invoices`로 이관되었다.
 *
 * Task 612: 더미 데이터 제거, 실제 Notion 데이터 연동
 * getDashboardStats()로 견적서 목록을 조회하여 통계를 집계한다.
 * getRecentActivity()로 최근 활동 목록을 도출한다.
 *
 * 이메일 마스킹 정책: 대시보드는 관리자 내부 도구이므로 마스킹 없이 이메일을
 * 노출하는 것이 원칙이나, 통계·최근 활동 요약에는 이름/상태만으로 충분하므로
 * 최소 노출 원칙에 따라 이메일 자체를 표시하지 않는다. 전체 이메일은 실제로
 * 필요한 클라이언트 목록·이메일 공유 다이얼로그(별도 작업)에서만 노출한다.
 */

import Link from 'next/link';
import { FileText, Flag, Users, Wallet, ClipboardList } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/patterns/empty-state';
import { formatCurrency, formatDate } from '@/lib/format';
import { getDashboardStatsCache } from '@/lib/dashboard';
import { getInvoiceListFromNotion } from '@/lib/notion';
import { getRecentActivity } from '@/lib/dashboard';
import type { InvoiceStatus, ActivityItem } from '@/lib/types';

export const metadata = {
  title: '대시보드 - 노션 기반 견적서 관리 시스템',
  description: '견적서 현황과 클라이언트 요약, 최근 활동을 한눈에 확인합니다.',
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: '작성 중',
  sent: '발송됨',
  viewed: '확인됨',
  paid: '결제 완료',
};

function getStatusBadgeVariant(status: InvoiceStatus) {
  switch (status) {
    case 'draft':
      return 'secondary';
    case 'sent':
      return 'default';
    case 'viewed':
      return 'outline';
    case 'paid':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export default async function AdminDashboardPage() {
  const databaseId = process.env.NOTION_DATABASE_ID;

  let stats = {
    totalInvoices: 0,
    invoicesByStatus: { draft: 0, sent: 0, viewed: 0, paid: 0 },
    totalAmount: 0,
    totalClients: 0,
  };
  let activity: ActivityItem[] = [];
  let hasError = false;

  if (!databaseId) {
    hasError = true;
  } else {
    try {
      // 대시보드 통계 조회
      stats = await getDashboardStatsCache(databaseId);

      // 최근 활동을 위해 최신 견적서들 조회
      const recentInvoices = await getInvoiceListFromNotion(databaseId, {
        pageSize: 50, // 최근 50건으로 충분 (10건만 표시)
      });

      // 최근 활동 생성
      activity = getRecentActivity(recentInvoices.invoices, 10);
    } catch (error) {
      console.error('대시보드 데이터 로드 오류:', error);
      hasError = true;
    }
  }

  if (!databaseId || hasError) {
    return (
      <>
        <PageHeader
          title='대시보드'
          description='견적서 현황을 한눈에 확인합니다.'
          contentClassName='max-w-none'
        />
        <Container className='max-w-none py-8'>
          <div className='bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm'>
            <p className='font-medium text-destructive'>조회 오류</p>
            <p className='text-destructive/90 mt-1'>
              {!databaseId
                ? 'NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다.'
                : '견적서 데이터를 불러올 수 없습니다.'}
            </p>
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
        title='대시보드'
        description='견적서 현황을 한눈에 확인합니다.'
        contentClassName='max-w-none'
      />
      <Container className='max-w-none space-y-8 py-8'>
        {/* 통계 카드 */}
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <Card className='min-w-0'>
            <CardHeader className='flex-row items-center justify-between space-y-0'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                총 견적서 수
              </CardTitle>
              <FileText className='h-4 w-4 text-muted-foreground' aria-hidden='true' />
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold'>{stats.totalInvoices}건</p>
            </CardContent>
          </Card>

          <Card className='min-w-0'>
            <CardHeader className='flex-row items-center justify-between space-y-0'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                상태별 건수
              </CardTitle>
              <ClipboardList className='h-4 w-4 text-muted-foreground' aria-hidden='true' />
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-1.5'>
                {(Object.keys(stats.invoicesByStatus) as InvoiceStatus[]).map((status) => (
                  <Badge key={status} variant={getStatusBadgeVariant(status)}>
                    {STATUS_LABELS[status]} {stats.invoicesByStatus[status]}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className='min-w-0'>
            <CardHeader className='flex-row items-center justify-between space-y-0'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                총 견적 금액
              </CardTitle>
              <Wallet className='h-4 w-4 text-muted-foreground' aria-hidden='true' />
            </CardHeader>
            <CardContent>
              <p className='truncate text-2xl font-bold'>
                {formatCurrency(stats.totalAmount, 'KRW')}
              </p>
            </CardContent>
          </Card>

          <Card className='min-w-0'>
            <CardHeader className='flex-row items-center justify-between space-y-0'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                클라이언트 수
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' aria-hidden='true' />
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold'>{stats.totalClients}명</p>
            </CardContent>
          </Card>
        </div>

        {/* 최근 활동 + 빠른 이동 */}
        <div className='grid gap-6 lg:grid-cols-3'>
          <Card className='min-w-0 lg:col-span-2'>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title='최근 활동이 없습니다'
                  description='견적서가 발행되면 이곳에 최근 활동이 표시됩니다.'
                />
              ) : (
                <ul className='divide-y divide-border'>
                  {activity.map((item, index) => (
                    <li key={`${item.invoice.id}-${index}`}>
                      <Link
                        href={`/invoice/${item.invoice.notionPageId}`}
                        className='flex min-w-0 items-center justify-between gap-4 rounded-md px-2 py-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                      >
                        <div className='min-w-0'>
                          <p className='truncate text-sm font-medium'>
                            <span className='text-muted-foreground'>
                              {item.type === 'issued' ? '발행' : '갱신'}
                            </span>{' '}
                            · {item.invoice.title}
                          </p>
                          <p className='truncate text-xs text-muted-foreground'>
                            {item.invoice.invoiceNumber} · {item.invoice.clientName}
                          </p>
                        </div>
                        <div className='flex shrink-0 items-center gap-3'>
                          <Badge variant={getStatusBadgeVariant(item.invoice.status)}>
                            {STATUS_LABELS[item.invoice.status]}
                          </Badge>
                          <span className='text-xs text-muted-foreground'>
                            {formatDate(item.occurredAt)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>빠른 이동</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-2'>
              <Link href='/admin/invoices'>
                <Button variant='outline' className='w-full justify-start gap-2'>
                  <FileText className='h-4 w-4' />
                  견적서 목록
                </Button>
              </Link>
              <Link href='/admin/reports'>
                <Button variant='outline' className='w-full justify-start gap-2'>
                  <Flag className='h-4 w-4' />
                  신고 관리
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
}
