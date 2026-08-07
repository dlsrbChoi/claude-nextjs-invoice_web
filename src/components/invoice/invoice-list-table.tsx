'use client';

import Link from 'next/link';
import { InvoiceSummary } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDate, formatCurrency } from '@/lib/format';
import { Copy, Check, ChevronRight } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface InvoiceListTableProps {
  invoices: InvoiceSummary[];
  isLoading?: boolean;
  onCopyLink?: (notionPageId: string) => void;
}

/** 복사 성공 시 아이콘을 되돌리기까지의 시간 (ms) */
const COPY_FEEDBACK_DURATION = 2000;

export function InvoiceListTable({ invoices, isLoading, onCopyLink }: InvoiceListTableProps) {
  // 방금 복사된 견적서 id (2초간 Copy → Check 아이콘 전환에 사용)
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = useCallback(
    async (invoice: InvoiceSummary) => {
      const notionPageId = invoice.notionPageId;
      const url = `${window.location.origin}/invoice/${notionPageId}`;

      try {
        await navigator.clipboard.writeText(url);
        toast.success('링크를 클립보드에 복사했습니다.', { id: 'copy-link' });
        setCopiedId(invoice.id);
        setTimeout(() => {
          setCopiedId((current) => (current === invoice.id ? null : current));
        }, COPY_FEEDBACK_DURATION);
        onCopyLink?.(notionPageId);
      } catch {
        // 클립보드 접근 실패(권한 없음, 비보안 컨텍스트 등) - 직접 선택 복사할 수 있도록 URL 노출
        toast.error(`링크 복사에 실패했습니다. 직접 복사해주세요: ${url}`, { id: 'copy-link' });
      }
    },
    [onCopyLink]
  );

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

  if (isLoading) {
    return (
      <Card className='p-8 text-center'>
        <p className='text-sm text-muted-foreground'>로딩 중...</p>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card className='p-12 text-center'>
        <p className='text-sm text-muted-foreground'>발행된 견적서가 없습니다.</p>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {/* 데스크톱 뷰 - 테이블 */}
      <div className='hidden md:block overflow-x-auto'>
        <table className='w-full text-sm'>
          <caption className='sr-only'>견적서 목록</caption>
          <thead>
            <tr className='bg-muted border-b-2 border-muted-foreground/40'>
              <th scope='col' className='text-left font-semibold py-3 px-4'>
                견적서
              </th>
              <th scope='col' className='text-left font-semibold py-3 px-4'>
                고객명
              </th>
              <th scope='col' className='text-left font-semibold py-3 px-4'>
                발급일
              </th>
              <th scope='col' className='text-right font-semibold py-3 px-4'>
                금액
              </th>
              <th scope='col' className='text-left font-semibold py-3 px-4'>
                상태
              </th>
              <th scope='col' className='text-right font-semibold py-3 px-4'>
                액션
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className='border-b border-muted-foreground/25 hover:bg-muted/50 transition-colors'
              >
                <td className='py-4 px-4'>
                  <div className='font-medium'>{invoice.title}</div>
                  <div className='text-xs text-muted-foreground'>{invoice.invoiceNumber}</div>
                </td>
                <td className='py-4 px-4 text-muted-foreground'>{invoice.clientName}</td>
                <td className='py-4 px-4 text-muted-foreground'>{formatDate(invoice.issueDate)}</td>
                <td className='py-4 px-4 text-right font-medium'>
                  {formatCurrency(invoice.totalAmount, invoice.currency)}
                </td>
                <td className='py-4 px-4'>
                  <Badge variant={getStatusBadgeVariant(invoice.status)}>
                    {getStatusLabel(invoice.status)}
                  </Badge>
                </td>
                <td className='py-4 px-4'>
                  <div className='flex items-center justify-end gap-2'>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleCopyLink(invoice)}
                            className='gap-2'
                          >
                            {copiedId === invoice.id ? (
                              <Check className='h-4 w-4' />
                            ) : (
                              <Copy className='h-4 w-4' />
                            )}
                            <span className='sr-only'>링크 복사</span>
                          </Button>
                        }
                      />
                      <TooltipContent>{`/invoice/${invoice.notionPageId}`}</TooltipContent>
                    </Tooltip>
                    <Link href={`/invoice/${invoice.notionPageId}`}>
                      <Button variant='ghost' size='sm' className='gap-2'>
                        <ChevronRight className='h-4 w-4' />
                        <span className='sr-only'>상세 조회</span>
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 뷰 - 카드 리스트 */}
      <div className='md:hidden space-y-3'>
        {invoices.map((invoice) => (
          <InvoiceListCard
            key={invoice.id}
            invoice={invoice}
            onCopyLink={handleCopyLink}
            isCopied={copiedId === invoice.id}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 모바일용 견적서 카드
 */
function InvoiceListCard({
  invoice,
  onCopyLink,
  isCopied,
}: {
  invoice: InvoiceSummary;
  onCopyLink: (invoice: InvoiceSummary) => void;
  isCopied: boolean;
}) {
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
    <Link href={`/invoice/${invoice.notionPageId}`}>
      <Card className='p-4 hover:bg-muted/50 transition-colors cursor-pointer'>
        <div className='space-y-3'>
          {/* 제목 및 송장번호 */}
          <div>
            <h3 className='font-semibold text-base'>{invoice.title}</h3>
            <p className='text-xs text-muted-foreground'>{invoice.invoiceNumber}</p>
          </div>

          {/* 고객명 및 발급일 */}
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-xs text-muted-foreground mb-1'>고객</p>
              <p className='font-medium'>{invoice.clientName}</p>
            </div>
            <div className='text-right'>
              <p className='text-xs text-muted-foreground mb-1'>발급일</p>
              <p className='font-medium'>{formatDate(invoice.issueDate)}</p>
            </div>
          </div>

          {/* 금액 및 상태 */}
          <div className='flex items-end justify-between border-t border-muted-foreground/25 pt-3'>
            <div>
              <p className='text-xs text-muted-foreground mb-1'>금액</p>
              <p className='font-bold text-lg'>
                {formatCurrency(invoice.totalAmount, invoice.currency)}
              </p>
            </div>
            <Badge variant={getStatusBadgeVariant(invoice.status)}>
              {getStatusLabel(invoice.status)}
            </Badge>
          </div>

          {/* 액션 버튼 */}
          <div className='flex gap-2 pt-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={(e) => {
                e.preventDefault();
                onCopyLink(invoice);
              }}
              className='flex-1 gap-2'
            >
              {isCopied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
              복사
            </Button>
            <Button
              variant='default'
              size='sm'
              onClick={(e) => {
                e.preventDefault();
              }}
              className='flex-1'
            >
              보기
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
