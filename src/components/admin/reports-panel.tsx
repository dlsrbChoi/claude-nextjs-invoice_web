'use client';

/**
 * 신고 관리 패널 (F035, Task 614)
 * 상태별 필터 탭 + 신고 목록 테이블 + 상세 보기 Dialog + 처리 액션 UI
 * 서버에서 전달받은 실제 데이터 및 페이지네이션 지원
 */

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Flag, Eye, ExternalLink, ChevronRight, ChevronLeft } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/patterns/empty-state';
import { formatDate } from '@/lib/format';
import type { Report, ReportStatus } from '@/lib/types';

/** 필터 탭 값 ('all'은 전체 보기를 의미하며 ReportStatus에는 포함되지 않음) */
type ReportFilter = ReportStatus | 'all';

/** 필터 탭 정의 (표시 순서 및 라벨) */
const REPORT_FILTERS: { value: ReportFilter; label: string }[] = [
  { value: 'pending', label: '미처리' },
  { value: 'reviewing', label: '검토 중' },
  { value: 'resolved', label: '해결됨' },
  { value: 'dismissed', label: '기각됨' },
  { value: 'all', label: '전체' },
];

/** 상태별 배지 variant/라벨 매핑 */
const STATUS_BADGE: Record<
  ReportStatus,
  { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }
> = {
  pending: { variant: 'default', label: '미처리' },
  reviewing: { variant: 'secondary', label: '검토 중' },
  resolved: { variant: 'outline', label: '해결됨' },
  dismissed: { variant: 'destructive', label: '기각됨' },
};

interface ReportsPanelProps {
  initialReports: Report[];
  pagination: {
    hasMore: boolean;
    nextCursor?: string;
    currentCursor?: string;
  };
}

export function ReportsPanel({ initialReports, pagination }: ReportsPanelProps) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [filter, setFilter] = useState<ReportFilter>('pending');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const filteredReports = reports.filter((report) =>
    filter === 'all' ? true : report.status === filter
  );

  /** 탭별 건수 (필터 라벨 옆에 표시) */
  const countByFilter = (value: ReportFilter) =>
    value === 'all' ? reports.length : reports.filter((report) => report.status === value).length;

  /** 신고 상태 변경 (서버에 요청 후 상태 업데이트) */
  const handleStatusChange = async (reportId: string, nextStatus: ReportStatus) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '상태 변경에 실패했습니다');
      }

      // 로컬 상태 업데이트
      setReports((prev) =>
        prev.map((report) => (report.id === reportId ? { ...report, status: nextStatus } : report))
      );
      toast.success(`신고 상태가 "${STATUS_BADGE[nextStatus].label}"(으)로 변경되었습니다.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '상태 변경에 실패했습니다';
      toast.error(errorMessage);
    }
  };

  /** 다음 페이지로 이동 */
  const handleNextPage = () => {
    if (!pagination.hasMore || !pagination.nextCursor) return;
    startTransition(() => {
      router.push(`?cursor=${pagination.nextCursor}`);
    });
  };

  /** 이전 페이지로 이동 (현재 커서 초기화) */
  const handlePrevPage = () => {
    startTransition(() => {
      router.push('?cursor=');
    });
  };

  return (
    <div className='space-y-4'>
      <Tabs value={filter} onValueChange={(value) => setFilter(value as ReportFilter)}>
        <TabsList className='h-auto flex-wrap'>
          {REPORT_FILTERS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label} ({countByFilter(item.value)})
            </TabsTrigger>
          ))}
        </TabsList>

        {REPORT_FILTERS.map((item) => (
          <TabsContent key={item.value} value={item.value} className='mt-4'>
            {filteredReports.length === 0 ? (
              <EmptyState
                icon={Flag}
                title='해당 상태의 신고가 없습니다'
                description='다른 필터를 선택하거나 이후 접수되는 신고를 확인해주세요.'
              />
            ) : (
              <ReportTable reports={filteredReports} onStatusChange={handleStatusChange} />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* 페이지네이션 컨트롤 */}
      {reports.length > 0 && (
        <div className='flex items-center justify-between border-t border-muted-foreground/25 pt-4'>
          <div className='text-xs text-muted-foreground'>
            총 {reports.length}개 신고 표시됨
            {pagination.currentCursor && ' (다음 페이지 존재)'}
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handlePrevPage}
              disabled={!pagination.currentCursor || isPending}
              className='gap-2'
            >
              <ChevronLeft className='h-4 w-4' />
              이전
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleNextPage}
              disabled={!pagination.hasMore || isPending}
              className='gap-2'
            >
              다음
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportTable({
  reports,
  onStatusChange,
}: {
  reports: Report[];
  onStatusChange: (reportId: string, nextStatus: ReportStatus) => void;
}) {
  return (
    <div className='space-y-4'>
      {/* 데스크톱 뷰 - 테이블 */}
      <div className='hidden md:block overflow-x-auto'>
        <table className='w-full text-sm'>
          <caption className='sr-only'>신고 목록</caption>
          <thead>
            <tr className='bg-muted border-b-2 border-muted-foreground/40'>
              <th scope='col' className='text-left font-semibold py-3 px-4'>
                접수일
              </th>
              <th scope='col' className='text-left font-semibold py-3 px-4'>
                대상 견적서
              </th>
              <th scope='col' className='text-left font-semibold py-3 px-4'>
                사유
              </th>
              <th scope='col' className='text-left font-semibold py-3 px-4'>
                신고자
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
            {reports.map((report) => (
              <tr
                key={report.id}
                className='border-b border-muted-foreground/25 hover:bg-muted/50 transition-colors'
              >
                <td className='py-4 px-4 whitespace-nowrap text-muted-foreground'>
                  {formatDate(report.submittedAt)}
                </td>
                <td className='py-4 px-4 max-w-48'>
                  <Link
                    href={`/invoice/${report.targetNotionPageId}`}
                    className='font-medium text-primary hover:underline line-clamp-2'
                  >
                    {report.targetInvoiceTitle}
                  </Link>
                </td>
                <td className='py-4 px-4 max-w-64'>
                  <p className='truncate text-muted-foreground'>{report.reason}</p>
                </td>
                <td className='py-4 px-4 text-muted-foreground'>{report.reporterName}</td>
                <td className='py-4 px-4'>
                  <Badge variant={STATUS_BADGE[report.status].variant}>
                    {STATUS_BADGE[report.status].label}
                  </Badge>
                </td>
                <td className='py-4 px-4'>
                  <div className='flex items-center justify-end gap-2'>
                    <ReportDetailDialog report={report} onStatusChange={onStatusChange} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 뷰 - 카드 리스트 */}
      <div className='md:hidden space-y-3'>
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} onStatusChange={onStatusChange} />
        ))}
      </div>
    </div>
  );
}

function ReportCard({
  report,
  onStatusChange,
}: {
  report: Report;
  onStatusChange: (reportId: string, nextStatus: ReportStatus) => void;
}) {
  return (
    <div className='rounded-xl bg-card p-4 ring-1 ring-foreground/10 space-y-3'>
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0'>
          <Link
            href={`/invoice/${report.targetNotionPageId}`}
            className='font-medium text-primary hover:underline block truncate'
          >
            {report.targetInvoiceTitle}
          </Link>
          <p className='text-xs text-muted-foreground mt-0.5'>{formatDate(report.submittedAt)}</p>
        </div>
        <Badge variant={STATUS_BADGE[report.status].variant} className='shrink-0'>
          {STATUS_BADGE[report.status].label}
        </Badge>
      </div>

      <p className='text-sm text-muted-foreground truncate'>{report.reason}</p>

      <div className='flex items-center justify-between border-t border-muted-foreground/25 pt-3'>
        <p className='text-xs text-muted-foreground'>신고자: {report.reporterName}</p>
        <ReportDetailDialog report={report} onStatusChange={onStatusChange} />
      </div>
    </div>
  );
}

/** 신고 상세 보기 Dialog + 처리 액션 버튼 (테이블/카드 공용) */
function ReportDetailDialog({
  report,
  onStatusChange,
}: {
  report: Report;
  onStatusChange: (reportId: string, nextStatus: ReportStatus) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleAction = (nextStatus: ReportStatus) => {
    onStatusChange(report.id, nextStatus);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant='ghost' size='sm' className='gap-2'>
            <Eye className='h-4 w-4' />
            상세 보기
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>신고 상세</DialogTitle>
          <DialogDescription>접수된 신고 내용을 확인하고 처리합니다.</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 text-sm'>
          <div>
            <p className='text-xs font-medium text-muted-foreground mb-1'>대상 견적서</p>
            <a
              href={`/invoice/${report.targetNotionPageId}`}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1 font-medium text-primary hover:underline'
            >
              {report.targetInvoiceTitle}
              <ExternalLink className='h-3.5 w-3.5' />
            </a>
          </div>

          <div>
            <p className='text-xs font-medium text-muted-foreground mb-1'>사유</p>
            <p className='whitespace-pre-wrap'>{report.reason}</p>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-xs font-medium text-muted-foreground mb-1'>신고자</p>
              <p>{report.reporterName}</p>
            </div>
            <div>
              <p className='text-xs font-medium text-muted-foreground mb-1'>신고자 이메일</p>
              <p>{report.reporterEmail ?? '-'}</p>
            </div>
          </div>

          <div>
            <p className='text-xs font-medium text-muted-foreground mb-1'>접수일</p>
            <p>{formatDate(report.submittedAt)}</p>
          </div>

          {report.resolutionNote && (
            <div>
              <p className='text-xs font-medium text-muted-foreground mb-1'>처리 이력 메모</p>
              <p className='whitespace-pre-wrap'>{report.resolutionNote}</p>
            </div>
          )}

          <div>
            <p className='text-xs font-medium text-muted-foreground mb-1'>현재 상태</p>
            <Badge variant={STATUS_BADGE[report.status].variant}>
              {STATUS_BADGE[report.status].label}
            </Badge>
          </div>
        </div>

        <DialogFooter>
          {report.status === 'pending' && (
            <>
              <Button variant='outline' onClick={() => handleAction('reviewing')}>
                검토 중
              </Button>
              <Button variant='outline' onClick={() => handleAction('dismissed')}>
                기각
              </Button>
              <Button onClick={() => handleAction('resolved')}>해결</Button>
            </>
          )}
          {report.status === 'reviewing' && (
            <>
              <Button variant='outline' onClick={() => handleAction('dismissed')}>
                기각
              </Button>
              <Button onClick={() => handleAction('resolved')}>해결</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
