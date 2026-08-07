/**
 * 대시보드 데이터 집계 로직
 * Task 612: Notion 견적서 목록을 조회하여 대시보드 통계로 변환
 *
 * 이 모듈은 기존 `getInvoiceListFromNotion()`을 호출하여 결과를 집계한다.
 * N+1 회피: 목록 조회 응답만으로 통계를 계산하며, 개별 항목 페이지를 조회하지 않는다.
 * (항목 조회는 상세 페이지에서만 수행)
 */

import { cache } from 'react';
import type { DashboardStats, ActivityItem, ClientSummary, InvoiceSummary } from './types';
import { getInvoiceListFromNotion } from './notion';

/**
 * Notion 견적서 목록을 조회하여 대시보드 통계로 집계
 *
 * @param databaseId Notion 데이터베이스 ID
 * @returns 대시보드 통계 (전체 건수, 상태별 건수, 총 금액, 클라이언트 수)
 */
export async function getDashboardStats(databaseId: string): Promise<DashboardStats> {
  try {
    // Notion 데이터베이스에서 모든 견적서 조회 (처음부터 마지막까지)
    // 대시보드는 전체 통계를 보여야 하므로 페이지네이션을 무시하고 모두 순회
    const allInvoices: InvoiceSummary[] = [];
    let cursor: string | undefined;
    let hasMore = true;

    // 큰 데이터베이스의 경우 여러 페이지를 순회할 수 있으므로
    // 합리적인 상한(e.g., 1000건)을 설정하여 무한 루프 방지
    const MAX_INVOICES = 1000;

    while (hasMore && allInvoices.length < MAX_INVOICES) {
      const result = await getInvoiceListFromNotion(databaseId, {
        startCursor: cursor,
        pageSize: 100, // 한 번에 100건씩 조회
      });

      allInvoices.push(...result.invoices);
      hasMore = result.hasMore;
      cursor = result.nextCursor;

      // 조회 상한 도달 시 경고
      if (allInvoices.length >= MAX_INVOICES) {
        console.warn(
          `대시보드 통계: 조회 상한(${MAX_INVOICES}건) 도달. 전체 건수가 이보다 많을 수 있습니다.`
        );
      }
    }

    // 통계 계산
    const stats: DashboardStats = {
      totalInvoices: allInvoices.length,
      invoicesByStatus: {
        draft: allInvoices.filter((i) => i.status === 'draft').length,
        sent: allInvoices.filter((i) => i.status === 'sent').length,
        viewed: allInvoices.filter((i) => i.status === 'viewed').length,
        paid: allInvoices.filter((i) => i.status === 'paid').length,
      },
      totalAmount: allInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
      totalClients: new Set(allInvoices.map((i) => i.clientName)).size,
    };

    return stats;
  } catch (error) {
    console.error('대시보드 통계 조회 중 오류:', error);
    // 에러 발생 시 기본값 반환 (UI는 0으로 렌더링됨)
    return {
      totalInvoices: 0,
      invoicesByStatus: {
        draft: 0,
        sent: 0,
        viewed: 0,
        paid: 0,
      },
      totalAmount: 0,
      totalClients: 0,
    };
  }
}

/**
 * React.cache()를 사용한 메모이제이션된 대시보드 통계 조회
 * 같은 databaseId에 대한 중복 요청을 렌더링 사이클 내에서 제거
 */
export const getDashboardStatsCache = cache(getDashboardStats);

/**
 * 최근 활동 목록 생성
 *
 * createdAt/updatedAt을 기준으로 활동을 해석:
 * - createdAt == updatedAt인 경우: 'issued' (신규 발행)
 * - createdAt < updatedAt인 경우: 'updated' (갱신)
 *
 * @param invoices 견적서 요약 목록 (일반적으로 생성 순서로 정렬됨)
 * @param limit 반환할 최대 활동 건수 (기본값: 10)
 * @returns 최근 활동 목록 (내림차순)
 */
export function getRecentActivity(invoices: InvoiceSummary[], limit: number = 10): ActivityItem[] {
  // createdAt 또는 updatedAt 중 더 최신인 것을 기준으로 정렬
  const sorted = [...invoices].sort((a, b) => {
    const aTime = new Date(a.updatedAt).getTime();
    const bTime = new Date(b.updatedAt).getTime();
    return bTime - aTime; // 내림차순 (최신이 먼저)
  });

  return sorted.slice(0, limit).map((invoice) => ({
    type: invoice.updatedAt === invoice.createdAt ? ('issued' as const) : ('updated' as const),
    invoice: {
      id: invoice.id,
      notionPageId: invoice.notionPageId,
      title: invoice.title,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      status: invoice.status,
    },
    occurredAt: invoice.updatedAt > invoice.createdAt ? invoice.updatedAt : invoice.createdAt,
  }));
}

/**
 * 클라이언트 요약 정보 생성
 *
 * clientName을 기준으로 그룹핑하여 각 클라이언트별 집계 정보를 도출:
 * - invoiceCount: 견적서 건수
 * - totalAmount: 누적 금액
 * - lastTransactionDate: 가장 최근 issueDate
 * - clientEmail: 가장 최근 견적서의 이메일
 *
 * @param invoices 견적서 요약 목록
 * @param sortBy 정렬 기준 ('lastTransactionDate' | 'invoiceCount' | 'totalAmount')
 * @returns 클라이언트 요약 목록
 */
export function getClientSummaries(
  invoices: InvoiceSummary[],
  sortBy: 'lastTransactionDate' | 'invoiceCount' | 'totalAmount' = 'lastTransactionDate'
): ClientSummary[] {
  const clientMap = new Map<string, ClientSummary>();

  for (const invoice of invoices) {
    const existing = clientMap.get(invoice.clientName);

    if (!existing) {
      clientMap.set(invoice.clientName, {
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        invoiceCount: 1,
        totalAmount: invoice.totalAmount,
        lastTransactionDate: invoice.issueDate,
      });
    } else {
      existing.invoiceCount += 1;
      existing.totalAmount += invoice.totalAmount;

      // issueDate가 더 최신이면 갱신 (문자열 직접 비교 가능: YYYY-MM-DD 형식)
      if (invoice.issueDate > existing.lastTransactionDate) {
        existing.lastTransactionDate = invoice.issueDate;
        existing.clientEmail = invoice.clientEmail;
      }
    }
  }

  // 정렬
  const sorted = Array.from(clientMap.values());
  switch (sortBy) {
    case 'invoiceCount':
      sorted.sort((a, b) => b.invoiceCount - a.invoiceCount);
      break;
    case 'totalAmount':
      sorted.sort((a, b) => b.totalAmount - a.totalAmount);
      break;
    case 'lastTransactionDate':
    default:
      sorted.sort((a, b) => (a.lastTransactionDate < b.lastTransactionDate ? 1 : -1));
      break;
  }

  return sorted;
}
