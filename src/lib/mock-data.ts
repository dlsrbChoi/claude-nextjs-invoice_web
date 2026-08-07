import {
  Invoice,
  InvoiceSummary,
  DashboardStats,
  ActivityItem,
  ClientSummary,
  Report,
} from './types';

export const mockInvoices: Invoice[] = [
  {
    id: 'mock-001',
    notionPageId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    title: '웹사이트 리디자인 프로젝트',
    invoiceNumber: 'INV-2026-001',
    clientName: '아름다운 카페 주식회사',
    clientEmail: 'contact@beautifulcafe.com',
    issueDate: '2026-08-01',
    validUntil: '2026-09-01',
    items: [
      {
        id: 'item-1',
        title: 'UI/UX 디자인',
        quantity: 1,
        unitPrice: 500000,
        amount: 500000,
        description: '메인페이지 및 서브페이지 UI/UX 디자인 (10페이지)',
      },
      {
        id: 'item-2',
        title: 'React 프론트엔드 개발',
        quantity: 2,
        unitPrice: 300000,
        amount: 600000,
        description: '80시간 기반 개발',
      },
    ],
    notes: '결제 조건: 계약금 50%, 완료 시 50% 잔금',
    totalAmount: 1100000,
    currency: 'KRW',
    status: 'draft',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'mock-002',
    notionPageId: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7',
    title: '모바일 앱 개발 제안',
    invoiceNumber: 'INV-2026-002',
    clientName: '스타트업 Inc.',
    clientEmail: 'founder@startup.io',
    issueDate: '2026-08-03',
    validUntil: '2026-09-02',
    items: [
      {
        id: 'item-5',
        title: 'iOS 앱 개발',
        quantity: 1,
        unitPrice: 1200000,
        amount: 1200000,
        description: 'Swift 기반 iOS 네이티브 앱 (60시간)',
      },
      {
        id: 'item-6',
        title: 'Android 앱 개발',
        quantity: 1,
        unitPrice: 1200000,
        amount: 1200000,
        description: 'Kotlin 기반 Android 네이티브 앱 (60시간)',
      },
    ],
    notes: '프로젝트 일정: 8월 - 10월\n마일스톤: 기능 설계(1주), 개발(8주), 테스트 및 배포(1주)',
    totalAmount: 2400000,
    currency: 'KRW',
    status: 'sent',
    createdAt: '2026-08-03T14:30:00Z',
    updatedAt: '2026-08-03T14:30:00Z',
  },
  {
    id: 'mock-003',
    notionPageId: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8',
    title: '블로그 테마 커스터마이징',
    invoiceNumber: 'INV-2026-003',
    clientName: '성공적인 블로거',
    clientEmail: 'blogger@example.com',
    issueDate: '2026-08-05',
    validUntil: '2026-08-20',
    items: [],
    notes: '',
    totalAmount: 0,
    currency: 'KRW',
    status: 'viewed',
    createdAt: '2026-08-05T09:15:00Z',
    updatedAt: '2026-08-05T09:15:00Z',
  },
];

export function getMockInvoice(notionPageId: string): Invoice | undefined {
  return mockInvoices.find((invoice) => invoice.notionPageId === notionPageId);
}

/**
 * 견적서 요약 목록 (관리자 대시보드·클라이언트 집계용 더미 데이터, Task 608/609)
 * mockInvoices에서 items를 제외한 요약 정보만 추출
 */
export const mockInvoiceSummaries: InvoiceSummary[] = mockInvoices.map((invoice) => {
  const summary = { ...invoice } as Partial<Invoice>;
  delete summary.items;
  return summary as InvoiceSummary;
});

/**
 * 대시보드 통계 더미 데이터 (F030, Task 608)
 * mockInvoiceSummaries를 집계한 결과와 일치하도록 구성
 */
export const mockDashboardStats: DashboardStats = {
  totalInvoices: mockInvoiceSummaries.length,
  invoicesByStatus: {
    draft: mockInvoiceSummaries.filter((i) => i.status === 'draft').length,
    sent: mockInvoiceSummaries.filter((i) => i.status === 'sent').length,
    viewed: mockInvoiceSummaries.filter((i) => i.status === 'viewed').length,
    paid: mockInvoiceSummaries.filter((i) => i.status === 'paid').length,
  },
  totalAmount: mockInvoiceSummaries.reduce((sum, i) => sum + i.totalAmount, 0),
  totalClients: new Set(mockInvoiceSummaries.map((i) => i.clientName)).size,
};

/**
 * 최근 활동 더미 데이터 (F030, Task 608)
 * createdAt 기준 발행 활동으로 해석 (updatedAt === createdAt이므로 모두 'issued')
 */
export const mockRecentActivity: ActivityItem[] = [...mockInvoiceSummaries]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .map((invoice) => ({
    type: 'issued' as const,
    invoice: {
      id: invoice.id,
      notionPageId: invoice.notionPageId,
      title: invoice.title,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      status: invoice.status,
    },
    occurredAt: invoice.createdAt,
  }));

/**
 * 클라이언트 요약 더미 데이터 (F030, Task 609)
 * mockInvoiceSummaries를 clientName 기준으로 그룹핑하여 집계
 */
export const mockClients: ClientSummary[] = Array.from(
  mockInvoiceSummaries
    .reduce((map, invoice) => {
      const existing = map.get(invoice.clientName);
      if (!existing) {
        map.set(invoice.clientName, {
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail,
          invoiceCount: 1,
          totalAmount: invoice.totalAmount,
          lastTransactionDate: invoice.issueDate,
        });
      } else {
        existing.invoiceCount += 1;
        existing.totalAmount += invoice.totalAmount;
        if (invoice.issueDate > existing.lastTransactionDate) {
          existing.lastTransactionDate = invoice.issueDate;
          existing.clientEmail = invoice.clientEmail;
        }
      }
      return map;
    }, new Map<string, ClientSummary>())
    .values()
).sort((a, b) => (a.lastTransactionDate < b.lastTransactionDate ? 1 : -1));

/**
 * 신고 더미 데이터 (F035, Task 611)
 * 다양한 처리 상태를 포함하도록 구성 (테이블·필터 탭 검증용)
 * reason/reporterName에 의도적으로 HTML 특수문자를 포함해 이스케이프 검증에 활용
 */
export const mockReports: Report[] = [
  {
    id: 'report-001',
    targetNotionPageId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    targetInvoiceTitle: '웹사이트 리디자인 프로젝트 (INV-2026-001)',
    reason: '견적 금액이 사전 협의 내용과 다릅니다. <script>alert(1)</script> 확인 부탁드립니다.',
    reporterName: '김철수 <담당자>',
    reporterEmail: 'chulsoo.kim@example.com',
    submittedAt: '2026-08-05T09:20:00Z',
    status: 'pending',
  },
  {
    id: 'report-002',
    targetNotionPageId: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7',
    targetInvoiceTitle: '모바일 앱 개발 제안 (INV-2026-002)',
    reason: '연락처 정보가 잘못 기재되어 있습니다.',
    reporterName: '이영희',
    reporterEmail: 'younghee.lee@example.com',
    submittedAt: '2026-08-04T15:40:00Z',
    status: 'reviewing',
    resolutionNote: '담당자 확인 중 (2026-08-05)',
  },
  {
    id: 'report-003',
    targetNotionPageId: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8',
    targetInvoiceTitle: '블로그 테마 커스터마이징 (INV-2026-003)',
    reason: '항목 설명이 비어 있어 내용을 확인할 수 없습니다.',
    reporterName: '박민수 & Co.',
    submittedAt: '2026-08-02T11:05:00Z',
    status: 'resolved',
    resolutionNote: '항목 설명을 보완하여 재발행 완료',
  },
  {
    id: 'report-004',
    targetNotionPageId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    targetInvoiceTitle: '웹사이트 리디자인 프로젝트 (INV-2026-001)',
    reason: '단순 문의였습니다. 신고 사유에 해당하지 않아 취소합니다.',
    reporterName: '최지훈',
    submittedAt: '2026-07-30T08:10:00Z',
    status: 'dismissed',
    resolutionNote: '신고 사유 미해당으로 기각',
  },
];
