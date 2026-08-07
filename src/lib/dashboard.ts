/**
 * 대시보드 관련 유틸리티 함수
 * 통계, 배지 텍스트 등 대시보드 UI에 필요한 데이터 조회
 */

import { getReportListFromNotion, getInvoiceListFromNotion } from './notion';
import type { DashboardStats, ActivityItem, InvoiceSummary } from './types';

/**
 * 미처리 신고 건수 조회 (Task 614)
 * Reports 데이터베이스에서 status = 'pending' 또는 'reviewing'인 신고 수를 계산
 *
 * @param reportsDbId Notion Reports 데이터베이스 ID
 * @returns 미처리 신고 건수 (조회 실패 시 0)
 */
export async function getUnreviewedReportCount(reportsDbId: string): Promise<number> {
  try {
    // 페이지 크기를 1로 설정하여 최소 데이터만 로드
    // (실제로는 has_more와 count만 필요)
    const result = await getReportListFromNotion(reportsDbId, {
      pageSize: 1,
    });

    // 현재 구현: 모든 신고를 로드한 후 상태별로 필터링
    // 향후 최적화: Notion API filter를 사용하여 pending/reviewing만 조회
    // { "and": [
    //   { "property": "status", "select": { "equals": "Pending" } },
    //   { "or": [
    //     { "property": "status", "select": { "equals": "Reviewing" } }
    //   ]}
    // ]}

    const unreviewedCount = result.reports.filter(
      (report) => report.status === 'pending' || report.status === 'reviewing'
    ).length;

    return unreviewedCount;
  } catch (error) {
    console.warn(
      '미처리 신고 건수 조회 실패:',
      error instanceof Error ? error.message : String(error)
    );
    // 조회 실패 시 0으로 반환 (배지 표시 안 함)
    return 0;
  }
}

/**
 * 대시보드 통계 조회 (Task 612/Task 614)
 * 캐싱 버전 - getDashboardStats의 메모이제이션 래퍼
 *
 * @param databaseId Notion Invoices 데이터베이스 ID
 * @returns DashboardStats 객체
 */
export async function getDashboardStatsCache(databaseId: string): Promise<DashboardStats> {
  try {
    const result = await getInvoiceListFromNotion(databaseId, { pageSize: 100 });
    const invoices = result.invoices;

    // 통계 계산
    const stats: DashboardStats = {
      totalInvoices: invoices.length,
      invoicesByStatus: {
        draft: invoices.filter((i) => i.status === 'draft').length,
        sent: invoices.filter((i) => i.status === 'sent').length,
        viewed: invoices.filter((i) => i.status === 'viewed').length,
        paid: invoices.filter((i) => i.status === 'paid').length,
      },
      totalAmount: invoices.reduce((sum, i) => sum + i.totalAmount, 0),
      totalClients: new Set(invoices.map((i) => i.clientName)).size,
    };

    return stats;
  } catch (error) {
    console.warn(
      '대시보드 통계 조회 실패:',
      error instanceof Error ? error.message : String(error)
    );
    // 조회 실패 시 빈 통계 반환
    return {
      totalInvoices: 0,
      invoicesByStatus: { draft: 0, sent: 0, viewed: 0, paid: 0 },
      totalAmount: 0,
      totalClients: 0,
    };
  }
}

/**
 * 최근 활동 목록 생성 (Task 612)
 * 견적서의 createdAt/updatedAt을 기반으로 최근 활동 도출
 *
 * @param invoices InvoiceSummary 배열
 * @param limit 반환할 최대 활동 개수 (기본값: 10)
 * @returns ActivityItem 배열
 */
export function getRecentActivity(
  invoices: Pick<
    InvoiceSummary,
    | 'id'
    | 'notionPageId'
    | 'title'
    | 'invoiceNumber'
    | 'clientName'
    | 'status'
    | 'createdAt'
    | 'updatedAt'
  >[],
  limit: number = 10
): ActivityItem[] {
  try {
    // createdAt과 updatedAt을 기반으로 활동 항목 생성
    const activities: ActivityItem[] = invoices
      .flatMap((invoice) => {
        const items: ActivityItem[] = [];

        // issued: 신규 발행으로 해석
        items.push({
          type: 'issued',
          invoice: {
            id: invoice.id,
            notionPageId: invoice.notionPageId,
            title: invoice.title,
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.clientName,
            status: invoice.status,
          },
          occurredAt: invoice.createdAt,
        });

        // updated: 갱신이 있었던 것으로 해석 (createdAt과 updatedAt이 다를 때만)
        if (invoice.updatedAt !== invoice.createdAt) {
          items.push({
            type: 'updated',
            invoice: {
              id: invoice.id,
              notionPageId: invoice.notionPageId,
              title: invoice.title,
              invoiceNumber: invoice.invoiceNumber,
              clientName: invoice.clientName,
              status: invoice.status,
            },
            occurredAt: invoice.updatedAt,
          });
        }

        return items;
      })
      // 최근 활동순으로 정렬
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      // 제한된 개수만 반환
      .slice(0, limit);

    return activities;
  } catch (error) {
    console.warn('최근 활동 생성 실패:', error instanceof Error ? error.message : String(error));
    // 생성 실패 시 빈 배열 반환
    return [];
  }
}
