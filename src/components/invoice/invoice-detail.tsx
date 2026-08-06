'use client';

import { Invoice, InvoiceItem } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/container';
import { Download, Mail } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/format';
import { toast } from 'sonner';

interface InvoiceDetailProps {
  invoice: Invoice;
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const handleDownloadPDF = () => {
    // 브라우저의 인쇄 기능 사용하여 PDF 다운로드
    // (인쇄 미리보기 → PDF로 저장 옵션 사용)
    window.print();
    toast.success('인쇄 대화상자가 열렸습니다. "PDF로 저장"을 선택하세요.');
  };
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'sent':
        return 'default';
      case 'viewed':
        return 'outline';
      case 'paid':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return '작성 중';
      case 'sent':
        return '발송됨';
      case 'viewed':
        return '확인됨';
      case 'paid':
        return '결제 완료';
      default:
        return status;
    }
  };

  return (
    <Container>
      <div className='space-y-6 print:space-y-4'>
        {/* 헤더 */}
        <Card className='p-6 print:border-0 print:bg-transparent print:p-0 print:shadow-none'>
          <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
            <div className='flex-1'>
              <h2 id='invoice-header' className='text-2xl md:text-3xl font-bold print:text-2xl'>
                {invoice.title}
              </h2>
              <p className='text-sm text-muted-foreground mt-2'>
                발급: {formatDate(invoice.issueDate)} | 송장 번호: {invoice.invoiceNumber}
              </p>
            </div>
            <div className='flex flex-col items-start md:items-end gap-2 print:hidden'>
              <Badge variant={getStatusBadgeVariant(invoice.status)}>
                {getStatusLabel(invoice.status)}
              </Badge>
              <p className='text-xs text-muted-foreground'>
                유효기간: {formatDate(invoice.validUntil)}
              </p>
            </div>
          </div>
        </Card>

        {/* 클라이언트 정보 */}
        <Card className='p-6 print:border-0 print:bg-transparent print:p-0 print:shadow-none'>
          <h3
            id='billing-info'
            className='text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3'
          >
            청구 대상
          </h3>
          <div className='space-y-1'>
            <p className='font-medium text-base'>{invoice.clientName}</p>
            {invoice.clientEmail && (
              <p className='text-sm text-muted-foreground flex items-center gap-2'>
                <Mail className='h-4 w-4 flex-shrink-0' />
                {invoice.clientEmail}
              </p>
            )}
          </div>
        </Card>

        {/* 항목 목록 - 데스크톱: 테이블, 모바일: 카드 */}
        <Card className='p-6 print:border-0 print:bg-transparent print:p-0 print:shadow-none'>
          <h3
            id='items-section'
            className='text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4'
          >
            항목
          </h3>

          {/* 테이블 뷰 (md 이상) */}
          <div className='hidden md:block print:block overflow-x-auto'>
            <table className='w-full text-sm'>
              <caption className='sr-only'>견적서 항목 상세 정보</caption>
              <thead>
                <tr className='border-b border-border'>
                  <th scope='col' className='text-left font-semibold py-4 px-2 md:px-4'>
                    품명
                  </th>
                  <th scope='col' className='text-right font-semibold py-4 px-2 md:px-4'>
                    수량
                  </th>
                  <th scope='col' className='text-right font-semibold py-4 px-2 md:px-4'>
                    단가
                  </th>
                  <th scope='col' className='text-right font-semibold py-4 px-2 md:px-4'>
                    합계
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.length > 0 ? (
                  invoice.items.map((item) => (
                    <tr
                      key={item.id}
                      className='border-b border-border hover:bg-muted/50 print:hover:bg-transparent'
                    >
                      <td className='py-5 px-2 md:px-4'>
                        <div>
                          <p className='font-medium'>{item.title}</p>
                          {item.description && (
                            <p className='text-xs text-muted-foreground mt-1'>{item.description}</p>
                          )}
                        </div>
                      </td>
                      <td className='text-right py-5 px-2 md:px-4'>{item.quantity}</td>
                      <td className='text-right py-5 px-2 md:px-4'>
                        {formatCurrency(item.unitPrice, invoice.currency)}
                      </td>
                      <td className='text-right py-5 px-2 md:px-4 font-medium'>
                        {formatCurrency(item.amount, invoice.currency)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className='text-center py-6 text-muted-foreground text-sm'>
                      항목이 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 카드 뷰 (md 미만) */}
          <div className='md:hidden space-y-3'>
            {invoice.items.length > 0 ? (
              invoice.items.map((item) => (
                <InvoiceItemCard key={item.id} item={item} currency={invoice.currency} />
              ))
            ) : (
              <div className='text-center py-6 text-muted-foreground text-sm'>항목이 없습니다</div>
            )}
          </div>
        </Card>

        {/* 합계 섹션 */}
        <Card className='p-6 bg-muted/50 print:bg-transparent print:border-0 print:p-0 print:shadow-none'>
          <div className='space-y-4'>
            {/* 비고 */}
            {invoice.notes && (
              <div className='pb-4 border-b border-border print:border-0 print:pb-0'>
                <p
                  id='notes-section'
                  className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2'
                >
                  비고
                </p>
                <p className='text-sm whitespace-pre-wrap text-foreground'>{invoice.notes}</p>
              </div>
            )}

            {/* 총액 */}
            <div className='flex justify-between items-baseline pt-2 print:pt-4'>
              <p className='text-sm font-semibold'>총액</p>
              <p className='text-3xl print:text-2xl font-bold'>
                {formatCurrency(invoice.totalAmount, invoice.currency)}
              </p>
            </div>
          </div>
        </Card>

        {/* 액션 버튼 */}
        <div className='flex flex-col sm:flex-row gap-3 print:hidden'>
          <Button onClick={handleDownloadPDF} variant='default' className='gap-2 w-full sm:w-auto'>
            <Download className='h-4 w-4' />
            PDF 다운로드
          </Button>
        </div>
      </div>
    </Container>
  );
}

/**
 * 모바일용 항목 카드 컴포넌트
 */
function InvoiceItemCard({ item, currency }: { item: InvoiceItem; currency: string }) {
  return (
    <div className='border border-border rounded-lg p-4 bg-background hover:bg-muted/30 transition-colors'>
      <div className='space-y-3'>
        {/* 품명 및 설명 */}
        <div>
          <p className='font-semibold text-sm'>{item.title}</p>
          {item.description && (
            <p className='text-xs text-muted-foreground mt-1'>{item.description}</p>
          )}
        </div>

        {/* 수량, 단가, 합계 */}
        <div className='grid grid-cols-3 gap-2 text-xs border-t border-border pt-3'>
          <div>
            <p className='text-muted-foreground mb-1'>수량</p>
            <p className='font-medium'>{item.quantity}</p>
          </div>
          <div className='text-center'>
            <p className='text-muted-foreground mb-1'>단가</p>
            <p className='font-medium'>{formatCurrency(item.unitPrice, currency)}</p>
          </div>
          <div className='text-right'>
            <p className='text-muted-foreground mb-1'>합계</p>
            <p className='font-bold text-sm'>{formatCurrency(item.amount, currency)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
