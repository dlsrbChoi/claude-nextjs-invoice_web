/**
 * Notion API 클라이언트
 * Notion 데이터베이스에서 견적서 데이터를 가져오는 기능
 */

import type { Invoice, InvoiceItem, NotionPageBlock } from './types'
import { getMockInvoice } from './mock-data'

const NOTION_API_VERSION = '2022-06-28'
const NOTION_API_BASE_URL = 'https://api.notion.com/v1'

/**
 * Notion API 요청을 위한 기본 헤더 생성
 */
function getNotionHeaders(): Record<string, string> {
  const apiKey = process.env.NOTION_API_KEY
  if (!apiKey) {
    throw new Error('NOTION_API_KEY 환경 변수가 설정되지 않았습니다')
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    'Notion-Version': NOTION_API_VERSION,
    'Content-Type': 'application/json',
  }
}

/**
 * Notion 페이지 ID에서 견적서 정보를 조회
 * 현재는 더미 데이터를 반환하며, Task 006에서 실제 Notion API 연동으로 변경됨
 */
export async function getInvoiceFromNotion(pageId: string): Promise<Invoice> {
  try {
    // 페이지 ID 유효성 검증
    if (!isValidNotionPageId(pageId)) {
      throw new Error('유효하지 않은 페이지 ID입니다')
    }

    // TODO: Task 006에서 실제 Notion API 호출로 변경
    // 현재는 더미 데이터 반환
    const mockInvoice = getMockInvoice(pageId)
    if (mockInvoice) {
      return mockInvoice
    }

    // Notion API에서 페이지 정보 조회
    const pageData = await fetchNotionPage(pageId)

    // 페이지 내용 조회
    const blocks = await fetchNotionPageBlocks(pageId)

    // 페이지 데이터를 Invoice 객체로 변환
    const invoice = parseInvoiceFromNotionPage(pageData, blocks)

    return invoice
  } catch (error) {
    console.error('Notion 견적서 조회 중 오류 발생:', error)
    throw error
  }
}

/**
 * Notion 페이지 정보 조회
 */
async function fetchNotionPage(pageId: string): Promise<Record<string, any>> {
  const response = await fetch(`${NOTION_API_BASE_URL}/pages/${pageId}`, {
    method: 'GET',
    headers: getNotionHeaders(),
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('요청하신 견적서를 찾을 수 없습니다')
    }
    throw new Error(`Notion API 오류: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Notion 페이지의 블록(내용) 조회
 */
async function fetchNotionPageBlocks(pageId: string): Promise<NotionPageBlock[]> {
  const blocks: NotionPageBlock[] = []
  let cursor: string | undefined

  try {
    while (true) {
      const url = new URL(`${NOTION_API_BASE_URL}/blocks/${pageId}/children`)
      if (cursor) {
        url.searchParams.set('start_cursor', cursor)
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: getNotionHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Notion API 오류: ${response.statusText}`)
      }

      const data = await response.json()
      blocks.push(...(data.results || []))

      if (!data.has_more) {
        break
      }
      cursor = data.next_cursor
    }
  } catch (error) {
    console.warn('페이지 내용 조회 중 경고:', error)
    // 내용 조회 실패해도 계속 진행
  }

  return blocks
}

/**
 * Notion 페이지 데이터를 Invoice 객체로 변환
 */
function parseInvoiceFromNotionPage(pageData: Record<string, any>, blocks: NotionPageBlock[]): Invoice {
  const properties = pageData.properties || {}

  // 기본 정보 추출 (property 이름은 실제 Notion 데이터베이스 구조에 맞게 수정 필요)
  const title = extractTextProperty(properties, 'title') || 'Untitled Invoice'
  const clientName = extractTextProperty(properties, '클라이언트') || 'Client'
  const clientEmail = extractTextProperty(properties, '이메일') || ''
  const issueDate = extractDateProperty(properties, '발급일') || new Date().toISOString().split('T')[0]
  const dueDate = extractDateProperty(properties, '납기일') || issueDate
  const notes = extractTextProperty(properties, '비고') || ''
  const currency = extractSelectProperty(properties, '통화') || 'KRW'
  const status = (extractSelectProperty(properties, '상태') || 'draft') as 'draft' | 'sent' | 'viewed' | 'paid'

  // 항목 정보 추출 (블록에서 테이블이나 리스트 형식으로 저장된 항목들)
  const items = parseInvoiceItems(blocks)

  // 총액 계산
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  return {
    id: pageData.id,
    notionPageId: pageData.id,
    title,
    clientName,
    clientEmail,
    issueDate,
    dueDate,
    items,
    notes,
    totalAmount,
    currency,
    status,
    createdAt: pageData.created_time,
    updatedAt: pageData.last_edited_time,
  }
}

/**
 * Notion 페이지에서 항목 정보 파싱
 */
function parseInvoiceItems(blocks: NotionPageBlock[]): InvoiceItem[] {
  const items: InvoiceItem[] = []

  // 현재는 간단한 구현 - 실제로는 테이블 블록이나 특정 형식의 데이터를 파싱해야 함
  // TODO: Notion 테이블 블록에서 항목 데이터 추출

  return items
}

/**
 * Notion 텍스트 속성 추출
 */
function extractTextProperty(properties: Record<string, any>, fieldName: string): string | null {
  const prop = properties[fieldName]
  if (!prop) return null

  if (prop.type === 'title' && prop.title && prop.title.length > 0) {
    return prop.title.map((t: any) => t.plain_text).join('')
  }

  if (prop.type === 'rich_text' && prop.rich_text && prop.rich_text.length > 0) {
    return prop.rich_text.map((t: any) => t.plain_text).join('')
  }

  return null
}

/**
 * Notion 날짜 속성 추출
 */
function extractDateProperty(properties: Record<string, any>, fieldName: string): string | null {
  const prop = properties[fieldName]
  if (!prop || prop.type !== 'date' || !prop.date) {
    return null
  }

  return prop.date.start
}

/**
 * Notion 선택지 속성 추출
 */
function extractSelectProperty(properties: Record<string, any>, fieldName: string): string | null {
  const prop = properties[fieldName]
  if (!prop || prop.type !== 'select' || !prop.select) {
    return null
  }

  return prop.select.name
}

/**
 * Notion 페이지 ID 유효성 검증
 * UUID 형식 또는 하이픈을 제거한 32자 형식
 */
function isValidNotionPageId(pageId: string): boolean {
  // UUID 형식: 8-4-4-4-12 또는 32자 문자열
  const uuidRegex = /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i
  return uuidRegex.test(pageId.replace(/-/g, ''))
}

/**
 * Notion 페이지 ID 정규화
 * 하이픈을 제거하거나 추가하여 표준 형식으로 변환
 */
export function normalizeNotionPageId(pageId: string): string {
  const cleaned = pageId.replace(/-/g, '')
  if (cleaned.length !== 32) {
    throw new Error('유효하지 않은 Notion 페이지 ID입니다')
  }

  // 표준 UUID 형식으로 변환: 8-4-4-4-12
  return `${cleaned.substring(0, 8)}-${cleaned.substring(8, 12)}-${cleaned.substring(12, 16)}-${cleaned.substring(16, 20)}-${cleaned.substring(20)}`
}
