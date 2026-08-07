/**
 * Notion API 클라이언트
 * Notion 데이터베이스에서 견적서 데이터를 가져오는 기능
 */

import { cache } from 'react';
import type {
  Invoice,
  InvoiceItem,
  NotionPageData,
  InvoiceSummary,
  InvoiceListResult,
  Report,
  ReportListResult,
} from './types';
import { getMockInvoice } from './mock-data';
import {
  parseInvoiceFromNotionPage,
  parseInvoiceItemFromNotionPage,
  extractRelationFromProperty,
  parseReportFromNotionPage,
} from './notion-parser';

const NOTION_API_VERSION = '2022-06-28';
const NOTION_API_BASE_URL = 'https://api.notion.com/v1';

/**
 * Notion API Property 이름 상수화
 * 실제 Notion 데이터베이스 구조에 맞춤
 */
const NOTION_PROPERTY_KEYS = {
  invoices: {
    title: '제목',
    clientName: 'client_name',
    clientEmail: 'client_email',
    invoiceNumber: 'invoice_number',
    issueDate: 'issue_date',
    validUntil: 'valid_until',
    status: 'status',
    totalAmount: 'total_amount',
    notes: 'notes',
    itemsRelation: 'items', // relation property명
  },
  items: {
    title: '제목',
    description: 'description',
    quantity: 'quantity',
    unitPrice: 'unit_price',
    amount: 'amount',
  },
  reports: {
    title: 'title', // 신고 제목
    targetInvoiceTitle: 'target_invoice_title', // 대상 견적서 제목
    targetNotionPageId: 'target_notion_page_id', // 대상 견적서 Notion 페이지 ID
    reason: 'reason', // 신고 사유
    reporterName: 'reporter_name', // 신고자 이름
    reporterEmail: 'reporter_email', // 신고자 이메일
    status: 'status', // 처리 상태
    resolutionNote: 'resolution_note', // 처리 이력 메모
  },
};

/**
 * Notion API 관련 커스텀 에러 클래스들
 */
export class NotionAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotionAPIError';
  }
}

export class NotionPageNotFoundError extends NotionAPIError {
  constructor(pageId: string) {
    super(`요청하신 견적서(${pageId})를 찾을 수 없습니다`);
    this.name = 'NotionPageNotFoundError';
  }
}

export class NotionInvalidPageIdError extends NotionAPIError {
  constructor(pageId: string) {
    super(`유효하지 않은 Notion 페이지 ID입니다: ${pageId}`);
    this.name = 'NotionInvalidPageIdError';
  }
}

export class NotionConfigError extends NotionAPIError {
  constructor(message: string = 'NOTION_API_KEY 환경 변수가 설정되지 않았습니다') {
    super(message);
    this.name = 'NotionConfigError';
  }
}

/**
 * Notion API 요청을 위한 기본 헤더 생성
 */
function getNotionHeaders(): Record<string, string> {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    throw new NotionConfigError();
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    'Notion-Version': NOTION_API_VERSION,
    'Content-Type': 'application/json',
  };
}

/**
 * fetch 캐싱 옵션 설정
 * Next.js 자동 캐싱: 60초 동안 중복 요청 제거 (ISR)
 */
function getFetchCacheOptions() {
  return {
    next: { revalidate: 60 }, // 60초마다 재검증
  };
}

/**
 * Notion 페이지 ID에서 견적서 정보를 조회 (내부 구현)
 * Notion API를 통해 실제 데이터를 로드하며, 항목들도 함께 조회
 *
 * @param pageId Notion 페이지 ID (32자 hex, UUID, 또는 URL 형식)
 * @returns 견적서 객체
 * @throws {NotionInvalidPageIdError} 유효하지 않은 페이지 ID 형식
 * @throws {NotionPageNotFoundError} 페이지를 찾을 수 없음
 * @throws {NotionAPIError} 기타 Notion API 오류
 */
async function getInvoiceFromNotionImpl(pageId: string): Promise<Invoice> {
  try {
    // 페이지 ID 정규화 및 검증
    const normalizedPageId = normalizeNotionPageId(pageId);

    // 먼저 더미 데이터가 있는지 확인
    const mockInvoice = getMockInvoice(normalizedPageId);
    if (mockInvoice) {
      return mockInvoice;
    }

    // Notion API에서 페이지 정보 조회
    const pageData = await fetchNotionPage(normalizedPageId);

    // 기본 견적서 정보 파싱
    const invoice = parseInvoiceFromNotionPage(pageData as NotionPageData);

    // Relation 필드에서 항목들 로드
    const items = await parseInvoiceItems(pageData as NotionPageData);
    invoice.items = items;

    // 총액 재계산
    invoice.totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    return invoice;
  } catch (error) {
    console.error('Notion 견적서 조회 중 오류 발생:', error);
    // 이미 우리의 커스텀 에러라면 그대로 throw, 아니면 래핑
    if (error instanceof NotionAPIError) {
      throw error;
    }
    throw new NotionAPIError(
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * React.cache()를 사용한 메모이제이션된 견적서 조회
 * 같은 pageId에 대한 중복 요청을 렌더링 사이클 내에서 제거
 * (60초 revalidate와 독립적으로 작동)
 */
export const getInvoiceFromNotion = cache(getInvoiceFromNotionImpl);

/**
 * Notion 데이터베이스에서 견적서 목록 조회 (관리자용)
 * @param databaseId Notion 데이터베이스 ID
 * @param options 쿼리 옵션 (커서, 페이지 크기, 필터)
 * @returns 견적서 요약 목록 및 페이지네이션 정보
 * @throws {NotionConfigError} NOTION_DATABASE_ID 미설정
 * @throws {NotionAPIError} 기타 API 오류
 */
async function getInvoiceListFromNotionImpl(
  databaseId: string,
  options: {
    startCursor?: string;
    pageSize?: number;
    filter?: object;
  } = {}
): Promise<InvoiceListResult> {
  try {
    const { startCursor, pageSize = 25, filter } = options;

    // 요청 본문 구성
    const requestBody = {
      sorts: [
        {
          property: NOTION_PROPERTY_KEYS.invoices.issueDate,
          direction: 'descending' as const,
        },
      ],
      page_size: pageSize,
      ...(startCursor && { start_cursor: startCursor }),
      ...(filter && { filter }),
    };

    // Notion 데이터베이스 쿼리 API 호출 (타임아웃 10초)
    let response: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      response = await fetch(`${NOTION_API_BASE_URL}/databases/${databaseId}/query`, {
        method: 'POST',
        headers: getNotionHeaders(),
        body: JSON.stringify(requestBody),
        signal: controller.signal,
        ...getFetchCacheOptions(),
      });

      clearTimeout(timeoutId);
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new NotionAPIError(`Notion API 요청 타임아웃 (10초). 서버 응답이 느립니다.`);
      }
      if (fetchError instanceof TypeError) {
        throw new NotionAPIError(`네트워크 오류: ${fetchError.message}. 인터넷 연결을 확인하세요.`);
      }
      throw fetchError;
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new NotionConfigError(
          `데이터베이스를 찾을 수 없습니다. NOTION_DATABASE_ID를 확인하세요.`
        );
      }
      if (response.status === 403) {
        throw new NotionConfigError(
          `이 데이터베이스에 접근할 수 있는 권한이 없습니다. Notion Integration 권한을 확인하세요.`
        );
      }
      if (response.status === 429) {
        throw new NotionAPIError(`Notion API 레이트 제한 도달. 잠시 후 다시 시도해주세요.`);
      }
      const errorBody = await response.text();
      console.error('Notion DB 쿼리 에러:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        databaseId,
      });
      throw new NotionAPIError(`Notion API 오류: ${response.statusText}`);
    }

    type NotionDatabaseQueryResponse = {
      results?: Array<{ id: string }>;
      has_more?: boolean;
      next_cursor?: string | null;
    };

    let data: NotionDatabaseQueryResponse;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new NotionAPIError(
        `Notion API 응답 파싱 실패: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
      );
    }

    // 쿼리 결과에서 견적서 목록 파싱
    const invoices: InvoiceSummary[] = [];
    const failedCount = { count: 0 };

    const results = (data.results || []) as unknown[];
    if (results.length === 0) {
      console.debug('Notion 쿼리 결과: 항목 없음');
    }

    for (let idx = 0; idx < results.length; idx++) {
      const page = results[idx] as unknown;
      try {
        // 기존 파서를 재사용 (쿼리 결과의 page 구조는 단일 조회와 동일)
        const invoice = parseInvoiceFromNotionPage(page as NotionPageData);

        // InvoiceSummary로 변환 (items 필드 제외)
        const summary: InvoiceSummary = {
          id: invoice.id,
          notionPageId: invoice.notionPageId,
          title: invoice.title,
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail,
          issueDate: invoice.issueDate,
          validUntil: invoice.validUntil,
          notes: invoice.notes,
          totalAmount: invoice.totalAmount,
          currency: invoice.currency,
          status: invoice.status,
          createdAt: invoice.createdAt,
          updatedAt: invoice.updatedAt,
        };

        invoices.push(summary);
      } catch (error) {
        failedCount.count += 1;
        const pageId = (page as Record<string, unknown> | undefined)?.id || `index-${idx}`;
        console.warn(
          `견적서 파싱 실패 (${pageId}):`,
          error instanceof Error ? error.message : String(error)
        );
        // 개별 항목 실패해도 계속 진행 (부분 성공 전략)
      }
    }

    // 부분 실패 감지
    if (failedCount.count > 0) {
      console.warn(
        `Notion 목록 조회 부분 성공: ${invoices.length}/${results.length} (실패: ${failedCount.count})`
      );
    }

    return {
      invoices,
      hasMore: data.has_more || false,
      nextCursor: data.next_cursor || undefined,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Notion 목록 조회 중 오류 발생:', errorMessage);

    if (error instanceof NotionAPIError || error instanceof NotionConfigError) {
      throw error;
    }

    throw new NotionAPIError(errorMessage || '목록을 조회할 수 없습니다');
  }
}

/**
 * 에러 처리 및 폴백을 포함한 Notion 목록 조회
 * @param databaseId Notion 데이터베이스 ID
 * @param options 쿼리 옵션 및 폴백 전략
 * @returns 견적서 요약 목록 (조회 실패 시 빈 배열)
 */
export async function getInvoiceListFromNotionWithFallback(
  databaseId: string,
  options: {
    startCursor?: string;
    pageSize?: number;
    filter?: object;
    fallbackToEmpty?: boolean; // 에러 시 빈 결과 반환 (기본값: true)
  } = {}
): Promise<InvoiceListResult> {
  const { fallbackToEmpty = true, ...queryOptions } = options;

  try {
    return await getInvoiceListFromNotionImpl(databaseId, queryOptions);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // 에러 유형 분류 및 로깅
    if (error instanceof NotionConfigError) {
      console.error('Notion 설정 오류 (복구 불가):', errorMessage);
      if (!fallbackToEmpty) {
        throw error;
      }
    } else if (error instanceof NotionAPIError) {
      console.error('Notion API 오류 (일시적일 수 있음):', errorMessage);
      if (!fallbackToEmpty) {
        throw error;
      }
    } else {
      console.error('예상치 못한 오류:', error);
      if (!fallbackToEmpty) {
        throw new NotionAPIError(
          error instanceof Error ? error.message : '목록을 조회할 수 없습니다'
        );
      }
    }

    // 폴백: 빈 결과 반환
    console.warn(
      `Notion 목록 조회 실패. 폴백 전략 적용 - 빈 결과 반환 (startCursor: ${queryOptions.startCursor || 'none'})`
    );
    return {
      invoices: [],
      hasMore: false,
      nextCursor: undefined,
    };
  }
}

/**
 * React.cache()를 사용한 메모이제이션된 목록 조회
 * fallbackToEmpty: true로 설정하여 에러 시 자동 폴백
 */
export const getInvoiceListFromNotion = cache((databaseId: string, options = {}) =>
  getInvoiceListFromNotionWithFallback(databaseId, {
    ...options,
    fallbackToEmpty: true,
  })
);

/**
 * Notion 신고 데이터베이스에서 신고 목록 조회 (관리자용, Task 614)
 * @param databaseId Notion 신고 데이터베이스 ID
 * @param options 쿼리 옵션 (커서, 페이지 크기, 필터)
 * @returns 신고 목록 및 페이지네이션 정보
 * @throws {NotionConfigError} NOTION_REPORTS_DATABASE_ID 미설정
 * @throws {NotionAPIError} 기타 API 오류
 */
async function getReportListFromNotionImpl(
  databaseId: string,
  options: {
    startCursor?: string;
    pageSize?: number;
    filter?: object;
  } = {}
): Promise<ReportListResult> {
  try {
    const { startCursor, pageSize = 25, filter } = options;

    // 요청 본문 구성
    const requestBody = {
      sorts: [
        {
          property: 'Created',
          direction: 'descending' as const,
        },
      ],
      page_size: pageSize,
      ...(startCursor && { start_cursor: startCursor }),
      ...(filter && { filter }),
    };

    // Notion 데이터베이스 쿼리 API 호출 (타임아웃 10초)
    let response: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      response = await fetch(`${NOTION_API_BASE_URL}/databases/${databaseId}/query`, {
        method: 'POST',
        headers: getNotionHeaders(),
        body: JSON.stringify(requestBody),
        signal: controller.signal,
        ...getFetchCacheOptions(),
      });

      clearTimeout(timeoutId);
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new NotionAPIError(`Notion API 요청 타임아웃 (10초). 서버 응답이 느립니다.`);
      }
      if (fetchError instanceof TypeError) {
        throw new NotionAPIError(`네트워크 오류: ${fetchError.message}. 인터넷 연결을 확인하세요.`);
      }
      throw fetchError;
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new NotionConfigError(
          `신고 데이터베이스를 찾을 수 없습니다. NOTION_REPORTS_DATABASE_ID를 확인하세요.`
        );
      }
      if (response.status === 403) {
        throw new NotionConfigError(
          `이 데이터베이스에 접근할 수 있는 권한이 없습니다. Notion Integration 권한을 확인하세요.`
        );
      }
      if (response.status === 429) {
        throw new NotionAPIError(`Notion API 레이트 제한 도달. 잠시 후 다시 시도해주세요.`);
      }
      const errorBody = await response.text();
      console.error('Notion 신고 DB 쿼리 에러:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        databaseId,
      });
      throw new NotionAPIError(`Notion API 오류: ${response.statusText}`);
    }

    type NotionDatabaseQueryResponse = {
      results?: Array<{ id: string }>;
      has_more?: boolean;
      next_cursor?: string | null;
    };

    let data: NotionDatabaseQueryResponse;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new NotionAPIError(
        `Notion API 응답 파싱 실패: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
      );
    }

    // 쿼리 결과에서 신고 목록 파싱
    const reports: Report[] = [];
    const failedCount = { count: 0 };

    const results = (data.results || []) as unknown[];
    if (results.length === 0) {
      console.debug('Notion 신고 쿼리 결과: 항목 없음');
    }

    for (let idx = 0; idx < results.length; idx++) {
      const page = results[idx] as unknown;
      try {
        const report = parseReportFromNotionPage(page as NotionPageData);
        reports.push(report);
      } catch (error) {
        failedCount.count += 1;
        const pageId = (page as Record<string, unknown> | undefined)?.id || `index-${idx}`;
        console.warn(
          `신고 파싱 실패 (${pageId}):`,
          error instanceof Error ? error.message : String(error)
        );
        // 개별 항목 실패해도 계속 진행 (부분 성공 전략)
      }
    }

    // 부분 실패 감지
    if (failedCount.count > 0) {
      console.warn(
        `Notion 신고 목록 조회 부분 성공: ${reports.length}/${results.length} (실패: ${failedCount.count})`
      );
    }

    return {
      reports,
      hasMore: data.has_more || false,
      nextCursor: data.next_cursor || undefined,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Notion 신고 목록 조회 중 오류 발생:', errorMessage);

    if (error instanceof NotionAPIError || error instanceof NotionConfigError) {
      throw error;
    }

    throw new NotionAPIError(errorMessage || '신고 목록을 조회할 수 없습니다');
  }
}

/**
 * 에러 처리 및 폴백을 포함한 Notion 신고 목록 조회
 * @param databaseId Notion 신고 데이터베이스 ID
 * @param options 쿼리 옵션 및 폴백 전략
 * @returns 신고 목록 (조회 실패 시 빈 배열)
 */
export async function getReportListFromNotionWithFallback(
  databaseId: string,
  options: {
    startCursor?: string;
    pageSize?: number;
    filter?: object;
    fallbackToEmpty?: boolean; // 에러 시 빈 결과 반환 (기본값: true)
  } = {}
): Promise<ReportListResult> {
  const { fallbackToEmpty = true, ...queryOptions } = options;

  try {
    return await getReportListFromNotionImpl(databaseId, queryOptions);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // 에러 유형 분류 및 로깅
    if (error instanceof NotionConfigError) {
      console.error('Notion 설정 오류 (복구 불가):', errorMessage);
      if (!fallbackToEmpty) {
        throw error;
      }
    } else if (error instanceof NotionAPIError) {
      console.error('Notion API 오류 (일시적일 수 있음):', errorMessage);
      if (!fallbackToEmpty) {
        throw error;
      }
    } else {
      console.error('예상치 못한 오류:', error);
      if (!fallbackToEmpty) {
        throw new NotionAPIError(
          error instanceof Error ? error.message : '신고 목록을 조회할 수 없습니다'
        );
      }
    }

    // 폴백: 빈 결과 반환
    console.warn(
      `Notion 신고 목록 조회 실패. 폴백 전략 적용 - 빈 결과 반환 (startCursor: ${queryOptions.startCursor || 'none'})`
    );
    return {
      reports: [],
      hasMore: false,
      nextCursor: undefined,
    };
  }
}

/**
 * React.cache()를 사용한 메모이제이션된 신고 목록 조회
 * fallbackToEmpty: true로 설정하여 에러 시 자동 폴백
 */
export const getReportListFromNotion = cache((databaseId: string, options = {}) =>
  getReportListFromNotionWithFallback(databaseId, {
    ...options,
    fallbackToEmpty: true,
  })
);

/**
 * Notion 페이지 정보 조회 (캐싱 포함)
 *
 * @throws {NotionPageNotFoundError} 404 응답 (페이지 없음)
 * @throws {NotionAPIError} 기타 API 오류
 */
async function fetchNotionPage(pageId: string): Promise<NotionPageData> {
  const response = await fetch(`${NOTION_API_BASE_URL}/pages/${pageId}`, {
    method: 'GET',
    headers: getNotionHeaders(),
    ...getFetchCacheOptions(),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new NotionPageNotFoundError(pageId);
    }
    if (response.status === 403) {
      throw new NotionAPIError(
        `이 페이지에 접근할 수 있는 권한이 없습니다. Notion Integration 권한을 확인하세요.`
      );
    }
    const errorBody = await response.text();
    console.error('Notion API 상세 에러:', {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
      pageId,
    });
    throw new NotionAPIError(`Notion API 오류: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Notion 페이지 데이터 (Properties):', Object.keys(data.properties || {}));
  return data;
}

/**
 * Notion 페이지에서 Relation 필드를 통해 항목 정보를 조회 및 파싱
 * InvoiceItems 테이블의 relation을 따라 각 항목 페이지를 로드
 *
 * @param pageData - Notion 페이지 데이터
 * @returns 견적서 항목 배열
 */
async function parseInvoiceItems(pageData: NotionPageData): Promise<InvoiceItem[]> {
  const items: InvoiceItem[] = [];

  try {
    // Relation 필드에서 연결된 항목 페이지 ID 추출
    const itemsRelation = extractRelationFromProperty(
      pageData.properties[NOTION_PROPERTY_KEYS.invoices.itemsRelation]
    );

    if (!itemsRelation || itemsRelation.length === 0) {
      return items;
    }

    // 각 항목 페이지 조회 및 파싱
    for (const itemPageId of itemsRelation) {
      try {
        const itemPageData = await fetchNotionPage(itemPageId);
        const item = parseInvoiceItemFromNotionPage(itemPageData as NotionPageData);
        items.push(item);
      } catch (error) {
        console.warn(`항목 페이지 조회 실패 (${itemPageId}):`, error);
        // 개별 항목 실패해도 계속 진행
      }
    }
  } catch (error) {
    console.warn('항목 파싱 중 경고:', error);
    // 항목 로드 실패해도 견적서는 반환
  }

  return items;
}

/**
 * Notion 페이지 ID 정규화
 * 3가지 입력 형식을 모두 지원:
 * 1. UUID 형식: "3b4fd327-70e4-80ac-86b4-f2337df0a16e"
 * 2. 32자 hex: "3b4fd32770e480ac86b4f2337df0a16e"
 * 3. Notion URL: "https://www.notion.so/3b4fd32770e480ac86b4f2337df0a16e?pvs=21"
 *
 * @param pageId 페이지 ID 또는 URL
 * @returns 표준 UUID 형식 (8-4-4-4-12)
 * @throws {NotionInvalidPageIdError} 유효하지 않은 ID 형식
 */
export function normalizeNotionPageId(pageId: string): string {
  if (!pageId || typeof pageId !== 'string') {
    throw new NotionInvalidPageIdError(pageId);
  }

  const trimmed = pageId.trim();

  // URL에서 페이지 ID 추출
  // https://www.notion.so/{title}-{id}?pvs=21 형식
  let extractedId = trimmed;
  if (trimmed.includes('notion.so')) {
    // 여러 URL 형식 지원
    // 1. https://www.notion.so/3b4fd32770e480ac86b4f2337df0a16e?pvs=21
    // 2. https://www.notion.so/projectname-3b4fd32770e480ac86b4f2337df0a16e
    // 3. https://app.notion.com/p/3b4fd32770e480ac86b4f2337df0a16e?pvs=21

    // 마지막 하이픈 이후의 32자 hex ID 찾기
    const match = trimmed.match(/(?:^|-)([a-f0-9]{32})(?:\?|$|\/)/i);
    if (match) {
      extractedId = match[1];
    } else {
      // 다른 형식: 마지막 슬래시 이후의 문자 추출
      const parts = trimmed.split('/');
      const lastPart = parts[parts.length - 1];
      // 쿼리 파라미터 제거
      const cleanedPart = lastPart.split('?')[0];
      // 마지막 하이픈으로 분할
      const segments = cleanedPart.split('-');
      if (segments.length > 0) {
        extractedId = segments[segments.length - 1];
      }
    }
  }

  // 하이픈 제거하여 정규화
  const cleaned = extractedId.replace(/-/g, '');

  // 32자 alphanumeric 확인
  if (cleaned.length !== 32 || !/^[a-z0-9]{32}$/i.test(cleaned)) {
    throw new NotionInvalidPageIdError(pageId);
  }

  // Notion API는 하이픈이 없는 32자 형식을 요구함
  return cleaned;
}
