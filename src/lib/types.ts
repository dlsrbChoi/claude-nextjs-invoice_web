/**
 * Notion API와 견적서 관련 타입 정의
 */

export interface InvoiceItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  description?: string
}

export interface Invoice {
  id: string
  notionPageId: string
  title: string
  clientName: string
  clientEmail: string
  issueDate: string
  dueDate: string
  items: InvoiceItem[]
  notes?: string
  totalAmount: number
  currency: string
  status: 'draft' | 'sent' | 'viewed' | 'paid'
  createdAt: string
  updatedAt: string
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
