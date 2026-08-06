/**
 * Notion API 클라이언트
 * Notion 데이터베이스에서 견적서 데이터를 가져오는 기능
 */

import type { Invoice, InvoiceItem, NotionPageData } from './types'
import { getMockInvoice } from './mock-data'
import {
  parseInvoiceFromNotionPage,
  parseInvoiceItemFromNotionPage,
  extractRelationFromProperty,
} from './notion-parser'

const NOTION_API_VERSION = '2022-06-28'
const NOTION_API_BASE_URL = 'https://api.notion.com/v1'

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
}

/**
 * Notion API 관련 커스텀 에러 클래스들
 */
export class NotionAPIError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotionAPIError'
  }
}

export class NotionPageNotFoundError extends NotionAPIError {
  constructor(pageId: string) {
    super(`요청하신 견적서(${pageId})를 찾을 수 없습니다`)
    this.name = 'NotionPageNotFoundError'
  }
}

export class NotionInvalidPageIdError extends NotionAPIError {
  constructor(pageId: string) {
    super(`유효하지 않은 Notion 페이지 ID입니다: ${pageId}`)
    this.name = 'NotionInvalidPageIdError'
  }
}

export class NotionConfigError extends NotionAPIError {
  constructor(message: string = 'NOTION_API_KEY 환경 변수가 설정되지 않았습니다') {
    super(message)
    this.name = 'NotionConfigError'
  }
}

/**
 * Notion API 요청을 위한 기본 헤더 생성
 */
function getNotionHeaders(): Record<string, string> {
  const apiKey = process.env.NOTION_API_KEY
  if (!apiKey) {
    throw new NotionConfigError()
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    'Notion-Version': NOTION_API_VERSION,
    'Content-Type': 'application/json',
  }
}

/**
 * Notion 페이지 ID에서 견적서 정보를 조회
 * Notion API를 통해 실제 데이터를 로드하며, 항목들도 함께 조회
 *
 * @param pageId Notion 페이지 ID (32자 hex, UUID, 또는 URL 형식)
 * @returns 견적서 객체
 * @throws {NotionInvalidPageIdError} 유효하지 않은 페이지 ID 형식
 * @throws {NotionPageNotFoundError} 페이지를 찾을 수 없음
 * @throws {NotionAPIError} 기타 Notion API 오류
 */
export async function getInvoiceFromNotion(pageId: string): Promise<Invoice> {
  try {
    // 페이지 ID 정규화 및 검증
    const normalizedPageId = normalizeNotionPageId(pageId)

    // 먼저 더미 데이터가 있는지 확인
    const mockInvoice = getMockInvoice(normalizedPageId)
    if (mockInvoice) {
      return mockInvoice
    }

    // Notion API에서 페이지 정보 조회
    const pageData = await fetchNotionPage(normalizedPageId)

    // 기본 견적서 정보 파싱
    const invoice = parseInvoiceFromNotionPage(pageData as NotionPageData)

    // Relation 필드에서 항목들 로드
    const items = await parseInvoiceItems(pageData as NotionPageData)
    invoice.items = items

    // 총액 재계산
    invoice.totalAmount = items.reduce((sum, item) => sum + item.amount, 0)

    return invoice
  } catch (error) {
    console.error('Notion 견적서 조회 중 오류 발생:', error)
    // 이미 우리의 커스텀 에러라면 그대로 throw, 아니면 래핑
    if (error instanceof NotionAPIError) {
      throw error
    }
    throw new NotionAPIError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다')
  }
}

/**
 * Notion 페이지 정보 조회
 *
 * @throws {NotionPageNotFoundError} 404 응답 (페이지 없음)
 * @throws {NotionAPIError} 기타 API 오류
 */
async function fetchNotionPage(pageId: string): Promise<NotionPageData> {
  const response = await fetch(`${NOTION_API_BASE_URL}/pages/${pageId}`, {
    method: 'GET',
    headers: getNotionHeaders(),
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new NotionPageNotFoundError(pageId)
    }
    if (response.status === 403) {
      throw new NotionAPIError(`이 페이지에 접근할 수 있는 권한이 없습니다. Notion Integration 권한을 확인하세요.`)
    }
    throw new NotionAPIError(`Notion API 오류: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Notion 페이지에서 Relation 필드를 통해 항목 정보를 조회 및 파싱
 * InvoiceItems 테이블의 relation을 따라 각 항목 페이지를 로드
 *
 * @param pageData - Notion 페이지 데이터
 * @returns 견적서 항목 배열
 */
async function parseInvoiceItems(pageData: NotionPageData): Promise<InvoiceItem[]> {
  const items: InvoiceItem[] = []

  try {
    // Relation 필드에서 연결된 항목 페이지 ID 추출
    const itemsRelation = extractRelationFromProperty(pageData.properties[NOTION_PROPERTY_KEYS.invoices.itemsRelation])

    if (!itemsRelation || itemsRelation.length === 0) {
      return items
    }

    // 각 항목 페이지 조회 및 파싱
    for (const itemPageId of itemsRelation) {
      try {
        const itemPageData = await fetchNotionPage(itemPageId)
        const item = parseInvoiceItemFromNotionPage(itemPageData as NotionPageData)
        items.push(item)
      } catch (error) {
        console.warn(`항목 페이지 조회 실패 (${itemPageId}):`, error)
        // 개별 항목 실패해도 계속 진행
      }
    }
  } catch (error) {
    console.warn('항목 파싱 중 경고:', error)
    // 항목 로드 실패해도 견적서는 반환
  }

  return items
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
    throw new NotionInvalidPageIdError(pageId)
  }

  const trimmed = pageId.trim()

  // URL에서 페이지 ID 추출
  // https://www.notion.so/{title}-{id}?pvs=21 형식
  let extractedId = trimmed
  if (trimmed.includes('notion.so')) {
    // 여러 URL 형식 지원
    // 1. https://www.notion.so/3b4fd32770e480ac86b4f2337df0a16e?pvs=21
    // 2. https://www.notion.so/projectname-3b4fd32770e480ac86b4f2337df0a16e
    // 3. https://app.notion.com/p/3b4fd32770e480ac86b4f2337df0a16e?pvs=21

    // 마지막 하이픈 이후의 32자 hex ID 찾기
    const match = trimmed.match(/(?:^|-)([a-f0-9]{32})(?:\?|$|\/)/i)
    if (match) {
      extractedId = match[1]
    } else {
      // 다른 형식: 마지막 슬래시 이후의 문자 추출
      const parts = trimmed.split('/')
      const lastPart = parts[parts.length - 1]
      // 쿼리 파라미터 제거
      const cleanedPart = lastPart.split('?')[0]
      // 마지막 하이픈으로 분할
      const segments = cleanedPart.split('-')
      if (segments.length > 0) {
        extractedId = segments[segments.length - 1]
      }
    }
  }

  // 하이픈 제거하여 정규화
  const cleaned = extractedId.replace(/-/g, '')

  // 32자 hex 확인
  if (cleaned.length !== 32 || !/^[a-f0-9]{32}$/i.test(cleaned)) {
    throw new NotionInvalidPageIdError(pageId)
  }

  // 표준 UUID 형식으로 변환: 8-4-4-4-12
  return `${cleaned.substring(0, 8)}-${cleaned.substring(8, 12)}-${cleaned.substring(12, 16)}-${cleaned.substring(16, 20)}-${cleaned.substring(20)}`
}
