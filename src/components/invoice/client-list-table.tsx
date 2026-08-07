/**
 * 클라이언트 목록 테이블 (F030, Task 609)
 * 데스크톱은 테이블, 모바일은 카드형으로 반응형 처리 (invoice-list-table.tsx와 동일한 패턴)
 * 정책: 클라이언트 목록은 관리자가 연락처를 확인하는 용도이므로 이메일을 마스킹하지 않고 그대로 노출한다.
 */

import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import type { ClientSummary } from '@/lib/types';

interface ClientListTableProps {
  clients: ClientSummary[];
}

export function ClientListTable({ clients }: ClientListTableProps) {
  if (clients.length === 0) {
    return (
      <Card className='p-12 text-center'>
        <p className='text-sm text-muted-foreground'>등록된 클라이언트가 없습니다.</p>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {/* 데스크톱 뷰 - 테이블 */}
      <div className='hidden md:block overflow-x-auto'>
        <table className='w-full text-sm'>
          <caption className='sr-only'>클라이언트 목록</caption>
          <thead>
            <tr className='bg-muted border-b-2 border-muted-foreground/40'>
              <th scope='col' className='text-left font-semibold py-3 px-4'>
                클라이언트명
              </th>
              <th scope='col' className='text-left font-semibold py-3 px-4'>
                이메일
              </th>
              <th scope='col' className='text-right font-semibold py-3 px-4'>
                견적서 건수
              </th>
              <th scope='col' className='text-right font-semibold py-3 px-4'>
                누적 금액
              </th>
              <th scope='col' className='text-left font-semibold py-3 px-4'>
                최근 거래일
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.clientName}
                className='border-b border-muted-foreground/25 hover:bg-muted/50 transition-colors'
              >
                <td className='py-4 px-4 font-medium'>{client.clientName}</td>
                <td className='py-4 px-4 text-muted-foreground'>{client.clientEmail}</td>
                <td className='py-4 px-4 text-right'>{client.invoiceCount}건</td>
                <td className='py-4 px-4 text-right font-medium'>
                  {formatCurrency(client.totalAmount, 'KRW')}
                </td>
                <td className='py-4 px-4 text-muted-foreground'>
                  {formatDate(client.lastTransactionDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 뷰 - 카드 리스트 */}
      <div className='md:hidden space-y-3'>
        {clients.map((client) => (
          <Card key={client.clientName} className='p-4'>
            <div className='space-y-3'>
              <div>
                <h3 className='font-semibold text-base'>{client.clientName}</h3>
                <p className='text-xs text-muted-foreground'>{client.clientEmail}</p>
              </div>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='text-xs text-muted-foreground mb-1'>견적서 건수</p>
                  <p className='font-medium'>{client.invoiceCount}건</p>
                </div>
                <div className='text-right'>
                  <p className='text-xs text-muted-foreground mb-1'>최근 거래일</p>
                  <p className='font-medium'>{formatDate(client.lastTransactionDate)}</p>
                </div>
              </div>
              <div className='border-t border-muted-foreground/25 pt-3'>
                <p className='text-xs text-muted-foreground mb-1'>누적 금액</p>
                <p className='font-bold text-lg'>{formatCurrency(client.totalAmount, 'KRW')}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
