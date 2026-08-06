/**
 * Notion API와 견적서 관련 타입 정의
 */

/**
 * 견적서 상태
 */
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid'

/**
 * 견적서 상태 매핑 (Notion select 필드값 → InvoiceStatus)
 */
export const INVOICE_STATUS_MAP: Record<string, InvoiceStatus> = {
  'draft (작성 중)': 'draft',
  'draft': 'draft',
  'sent': 'sent',
  'viewed': 'viewed',
  'paid': 'paid',
}

/**
 * 견적서 항목
 * Notion InvoiceItems 테이블에서 파싱됨
 */
export interface InvoiceItem {
  id: string
  title: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  invoiceId?: string
}

/**
 * 견적서
 * Notion Invoices 테이블에서 파싱됨
 */
export interface Invoice {
  id: string
  notionPageId: string
  title: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  issueDate: string
  validUntil: string
  items: InvoiceItem[]
  notes?: string
  totalAmount: number
  currency: string
  status: InvoiceStatus
  createdAt: string
  updatedAt: string
}

/**
 * Notion 속성(Property) 타입들
 */

export interface NotionTextProperty {
  type: 'title' | 'rich_text'
  title?: Array<{ plain_text: string; href?: string | null }>
  rich_text?: Array<{ plain_text: string; href?: string | null }>
}

export interface NotionDateProperty {
  type: 'date'
  date: {
    start: string
    end?: string | null
    time_zone?: string | null
  }
}

export interface NotionSelectProperty {
  type: 'select'
  select: {
    id: string
    name: string
    color: string
  } | null
}

export interface NotionNumberProperty {
  type: 'number'
  number: number | null
}

export interface NotionEmailProperty {
  type: 'email'
  email: string | null
}

export interface NotionRelationProperty {
  type: 'relation'
  relation: Array<{
    id: string
  }>
}

export type NotionProperty =
  | NotionTextProperty
  | NotionDateProperty
  | NotionSelectProperty
  | NotionNumberProperty
  | NotionEmailProperty
  | NotionRelationProperty
  | { type: string; [key: string]: unknown }

/**
 * Notion 페이지 데이터 구조
 */
export interface NotionPageData {
  id: string
  created_time: string
  last_edited_time: string
  created_by: { object: string; id: string }
  last_edited_by: { object: string; id: string }
  cover?: { type: string; external?: { url: string } } | null
  icon?: { type: string; emoji: string } | null
  parent: {
    type: 'database_id' | 'page_id' | 'workspace' | 'block'
    database_id?: string
    page_id?: string
  }
  archived: boolean
  properties: Record<string, NotionProperty>
  url: string
  public_url?: string | null
}

export interface NotionPageBlock {
  object: string
  id: string
  created_time: string
  last_edited_time: string
  created_by: {
    object: string
    id: string
  }
  last_edited_by: {
    object: string
    id: string
  }
  has_children: boolean
  archived: boolean
  type: string
  [key: string]: unknown
}

export interface NotionDatabase {
  object: string
  id: string
  created_time: string
  last_edited_time: string
  created_by: {
    object: string
    id: string
  }
  last_edited_by: {
    object: string
    id: string
  }
  title: Array<{
    type: string
    text: {
      content: string
      link: string | null
    }
  }>
  description: unknown[]
  icon: null | {
    type: string
    emoji: string
  }
  cover: null | {
    type: string
    external: {
      url: string
    }
  }
  properties: Record<string, unknown>
  parent: {
    type: string
    page_id?: string
    database_id?: string
    workspace?: boolean
  }
  url: string
  public_url: string | null
}
