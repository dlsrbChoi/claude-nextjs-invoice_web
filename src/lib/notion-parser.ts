/**
 * Notion API 데이터 파싱 및 변환 유틸리티
 * Notion 고유의 데이터 구조를 도메인 타입으로 변환
 */

import type {
  InvoiceItem,
  Invoice,
  InvoiceStatus,
  NotionProperty,
  NotionPageData,
  NotionTextProperty,
  NotionDateProperty,
  NotionSelectProperty,
  NotionNumberProperty,
  NotionEmailProperty,
  NotionRelationProperty,
  Report,
  ReportStatus,
} from './types';
import { INVOICE_STATUS_MAP } from './types';

/**
 * Notion 텍스트 속성(Title, Rich Text)에서 평문 추출
 */
export function extractTextFromProperty(prop: NotionProperty | undefined): string | null {
  if (!prop) return null;

  const textProp = prop as NotionTextProperty;

  if (textProp.type === 'title' && textProp.title?.length) {
    return textProp.title.map((t) => t.plain_text).join('');
  }

  if (textProp.type === 'rich_text' && textProp.rich_text?.length) {
    return textProp.rich_text.map((t) => t.plain_text).join('');
  }

  return null;
}

/**
 * Notion 이메일 속성에서 이메일 주소 추출
 */
export function extractEmailFromProperty(prop: NotionProperty | undefined): string | null {
  if (!prop || prop.type !== 'email') return null;

  const emailProp = prop as NotionEmailProperty;
  return emailProp.email ?? null;
}

/**
 * Notion 숫자 속성에서 숫자 추출
 */
export function extractNumberFromProperty(prop: NotionProperty | undefined): number | null {
  if (!prop || prop.type !== 'number') return null;

  const numProp = prop as NotionNumberProperty;
  return numProp.number ?? null;
}

/**
 * Notion Select 속성에서 선택값 추출
 */
export function extractSelectFromProperty(prop: NotionProperty | undefined): string | null {
  if (!prop || prop.type !== 'select') return null;

  const selectProp = prop as NotionSelectProperty;
  return selectProp.select?.name ?? null;
}

/**
 * Notion Date 속성에서 날짜 추출
 */
export function extractDateFromProperty(prop: NotionProperty | undefined): string | null {
  if (!prop || prop.type !== 'date') return null;

  const dateProp = prop as NotionDateProperty;
  return dateProp.date?.start ?? null;
}

/**
 * Notion Relation 속성에서 관련 페이지 ID 배열 추출
 */
export function extractRelationFromProperty(prop: NotionProperty | undefined): string[] {
  if (!prop || prop.type !== 'relation') return [];

  const relProp = prop as NotionRelationProperty;
  return relProp.relation.map((r) => r.id);
}

/**
 * 통화 기호가 포함된 금액 문자열을 숫자로 변환
 * 지원: "₩2,500,000", "2,500,000", "2500000", "$1,000"
 *
 * @param amountStr 금액 문자열
 * @returns 숫자만 추출한 금액
 * @throws {Error} 숫자로 변환할 수 없는 형식
 */
export function parseAmount(amountStr: string): number {
  if (!amountStr) return 0;

  const numericStr = amountStr.replace(/[^\d\-]/g, '');
  const parsed = parseInt(numericStr, 10);

  if (isNaN(parsed)) {
    throw new Error(`금액 형식을 인식할 수 없습니다: ${amountStr}`);
  }

  return parsed;
}

/**
 * Notion 날짜를 ISO 8601 형식으로 변환
 * 지원 형식:
 * - 한글: "2026년 8월 1일"
 * - ISO: "2026-08-01"
 * - 영문: "Aug 1, 2026"
 *
 * @param dateStr 날짜 문자열
 * @returns ISO 8601 형식의 날짜 (YYYY-MM-DD)
 * @throws {Error} 날짜로 변환할 수 없는 형식
 */
export function parseDateToISO(dateStr: string): string {
  if (!dateStr) {
    return new Date().toISOString().split('T')[0];
  }

  const trimmed = dateStr.trim();

  // 한글 포맷: "2026년 8월 1일"
  const koreanMatch = trimmed.match(/(\d{4})년\s+(\d{1,2})월\s+(\d{1,2})일/);
  if (koreanMatch) {
    const [, year, month, day] = koreanMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // ISO 포맷: "2026-08-01"
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // 영문 및 기타 포맷 (JavaScript Date로 파싱)
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  throw new Error(`날짜 형식을 인식할 수 없습니다: ${dateStr}`);
}

/**
 * Notion select 필드 값을 InvoiceStatus로 정규화
 * 한글 설명이 포함된 값도 처리: "draft (작성 중)" → "draft"
 *
 * @param statusStr 상태값 문자열
 * @returns 정규화된 InvoiceStatus
 */
export function normalizeStatus(statusStr: string): InvoiceStatus {
  if (!statusStr) return 'draft';

  const normalized = statusStr.toLowerCase().trim();

  // 괄호 안 설명 제거: "draft (작성 중)" → "draft"
  const baseStatus = normalized.split('(')[0].trim();

  // 매핑 테이블에서 찾기
  const mapped = Object.entries(INVOICE_STATUS_MAP).find(([key]) =>
    key.toLowerCase().startsWith(baseStatus)
  );

  return mapped ? mapped[1] : 'draft';
}

/**
 * Notion 페이지 데이터를 Invoice 객체로 변환
 * 모든 필드를 파싱하고 검증
 *
 * @param pageData Notion 페이지 데이터
 * @returns 파싱된 Invoice 객체
 */
export function parseInvoiceFromNotionPage(pageData: NotionPageData): Invoice {
  const props = pageData.properties;

  // 필수 필드 추출
  const title =
    extractTextFromProperty(props['제목']) ?? extractTextFromProperty(props['title']) ?? 'Untitled';
  const clientName =
    extractTextFromProperty(props['client_name']) ??
    extractTextFromProperty(props['클라이언트']) ??
    'Unknown Client';
  const clientEmail =
    extractEmailFromProperty(props['client_email']) ??
    extractTextFromProperty(props['이메일']) ??
    '';
  const invoiceNumber =
    extractTextFromProperty(props['invoice_number']) ??
    extractTextFromProperty(props['번호']) ??
    '';

  // 날짜 파싱
  let issueDate: string;
  const issueDateProp =
    extractDateFromProperty(props['issue_date']) ?? extractDateFromProperty(props['발급일']);
  if (issueDateProp) {
    issueDate = parseDateToISO(issueDateProp);
  } else {
    issueDate = new Date().toISOString().split('T')[0];
  }

  let validUntil: string;
  const validUntilProp =
    extractDateFromProperty(props['valid_until']) ?? extractDateFromProperty(props['유효기간']);
  if (validUntilProp) {
    validUntil = parseDateToISO(validUntilProp);
  } else {
    validUntil = issueDate;
  }

  // 상태 파싱
  const statusStr =
    extractSelectFromProperty(props['status']) ??
    extractSelectFromProperty(props['상태']) ??
    'draft';
  const status = normalizeStatus(statusStr);

  // 항목 (임시 빈 배열 - Task 006에서 Relation 로드)
  const items: InvoiceItem[] = [];

  // 총액 계산 (임시)
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  // 비고
  const notes =
    extractTextFromProperty(props['notes']) ?? extractTextFromProperty(props['비고']) ?? '';

  // 통화 (기본값: KRW)
  const currency =
    extractSelectFromProperty(props['통화']) ??
    extractSelectFromProperty(props['currency']) ??
    'KRW';

  return {
    id: pageData.id,
    notionPageId: pageData.id,
    title,
    invoiceNumber,
    clientName,
    clientEmail,
    issueDate,
    validUntil,
    items,
    notes,
    totalAmount,
    currency,
    status,
    createdAt: pageData.created_time,
    updatedAt: pageData.last_edited_time,
  };
}

/**
 * Notion 페이지 데이터를 InvoiceItem 객체로 변환
 *
 * @param pageData Notion 페이지 데이터 (InvoiceItems 테이블 레코드)
 * @returns 파싱된 InvoiceItem 객체
 */
export function parseInvoiceItemFromNotionPage(pageData: NotionPageData): InvoiceItem {
  const props = pageData.properties;

  // 필수 필드 추출
  const title =
    extractTextFromProperty(props['제목']) ?? extractTextFromProperty(props['title']) ?? 'Untitled';
  const description =
    extractTextFromProperty(props['description']) ?? extractTextFromProperty(props['설명']) ?? '';
  const quantity =
    extractNumberFromProperty(props['quantity']) ?? extractNumberFromProperty(props['수량']) ?? 1;

  // 단가 (숫자 또는 통화 형식)
  let unitPrice = 0;
  const unitPriceProp =
    extractNumberFromProperty(props['unit_price']) ?? extractNumberFromProperty(props['단가']);
  if (typeof unitPriceProp === 'number') {
    unitPrice = unitPriceProp;
  } else {
    const unitPriceStr =
      extractTextFromProperty(props['unit_price']) ?? extractTextFromProperty(props['단가']) ?? '0';
    unitPrice = parseAmount(unitPriceStr);
  }

  // 총액 (선택적 - 계산으로 재산출 가능)
  let amount = 0;
  const amountProp =
    extractNumberFromProperty(props['amount']) ?? extractNumberFromProperty(props['총액']);
  if (typeof amountProp === 'number') {
    amount = amountProp;
  } else {
    const amountStr =
      extractTextFromProperty(props['amount']) ?? extractTextFromProperty(props['총액']) ?? '0';
    amount = parseAmount(amountStr);
  }

  // 만약 amount가 0이면 quantity × unitPrice로 계산
  if (amount === 0) {
    amount = quantity * unitPrice;
  }

  return {
    id: pageData.id,
    title,
    description,
    quantity,
    unitPrice,
    amount,
  };
}

/**
 * 신고 상태 문자열을 ReportStatus로 정규화 (Task 614)
 * Notion select 필드값 → ReportStatus 타입
 *
 * @param statusStr 상태값 문자열
 * @returns 정규화된 ReportStatus
 */
export function normalizeReportStatus(statusStr: string): ReportStatus {
  if (!statusStr) return 'pending';

  const normalized = statusStr.toLowerCase().trim();

  // ReportStatus 값 목록에서 매칭
  if (['pending', 'reviewing', 'resolved', 'dismissed'].includes(normalized)) {
    return normalized as ReportStatus;
  }

  return 'pending';
}

/**
 * Notion 페이지 데이터를 Report 객체로 변환 (Task 614)
 *
 * @param pageData Notion 신고 데이터베이스의 페이지 데이터
 * @returns 파싱된 Report 객체
 */
export function parseReportFromNotionPage(pageData: NotionPageData): Report {
  const props = pageData.properties;

  // 필수 필드 추출
  const targetInvoiceTitle = extractTextFromProperty(props['title']) ?? 'Unknown Invoice';

  const targetNotionPageId = extractTextFromProperty(props['target_notion_page_id']) ?? '';

  const reason = extractTextFromProperty(props['reason']) ?? '';

  const reporterName = extractTextFromProperty(props['reporter_name']) ?? 'Anonymous';

  const reporterEmail = extractEmailFromProperty(props['reporter_email']) ?? undefined;

  // 상태 파싱
  const statusStr =
    extractSelectFromProperty(props['status']) ??
    extractSelectFromProperty(props['상태']) ??
    'pending';
  const status = normalizeReportStatus(statusStr);

  // 처리 이력 메모
  const resolutionNote =
    extractTextFromProperty(props['resolution_note']) ??
    extractTextFromProperty(props['처리_메모']) ??
    undefined;

  return {
    id: pageData.id,
    targetNotionPageId,
    targetInvoiceTitle,
    reason,
    reporterName,
    reporterEmail,
    status,
    resolutionNote,
    submittedAt: pageData.created_time,
  };
}
