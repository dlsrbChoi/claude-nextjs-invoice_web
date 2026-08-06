'use client'

import { Invoice } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Mail } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/format'

interface InvoiceDetailProps {
  invoice: Invoice
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary'
      case 'sent':
        return 'default'
      case 'viewed':
        return 'outline'
      case 'paid':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return '작성 중'
      case 'sent':
        return '발송됨'
      case 'viewed':
        return '확인됨'
      case 'paid':
        return '결제 완료'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{invoice.title}</h1>
            <p className="text-muted-foreground mt-1">
              발급: {formatDate(invoice.issueDate)}
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <Badge variant={getStatusBadgeVariant(invoice.status)}>
              {getStatusLabel(invoice.status)}
            </Badge>
            <p className="text-sm text-muted-foreground">
              납기일: {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>
      </Card>

      {/* 클라이언트 정보 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">청구 대상</h2>
        <div className="space-y-2">
          <p className="font-medium">{invoice.clientName}</p>
          {invoice.clientEmail && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {invoice.clientEmail}
            </p>
          )}
        </div>
      </Card>

      {/* 항목 목록 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">항목</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-semibold py-2 px-2">품명</th>
                <th className="text-right font-semibold py-2 px-2">수량</th>
                <th className="text-right font-semibold py-2 px-2">단가</th>
                <th className="text-right font-semibold py-2 px-2">합계</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.length > 0 ? (
                invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-3 px-2">{item.quantity}</td>
                    <td className="text-right py-3 px-2">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="text-right py-3 px-2 font-medium">
                      {formatCurrency(item.quantity * item.unitPrice, invoice.currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-muted-foreground">
                    항목이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 합계 */}
      <Card className="p-6 bg-muted/50">
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            {invoice.notes && (
              <div>
                <p className="font-semibold mb-2">비고</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-muted-foreground mb-2">총액</p>
              <p className="text-2xl font-bold">
                {formatCurrency(invoice.totalAmount, invoice.currency)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          PDF 다운로드
        </Button>
      </div>

      {/* 메타데이터 */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>페이지 ID: {invoice.notionPageId}</p>
        <p>업데이트: {formatDate(invoice.updatedAt)}</p>
      </div>
    </div>
  )
}
