'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportDialogProps {
  notionPageId: string;
}

export function ReportDialog({ notionPageId }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reporterEmail, setReporterEmail] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reporterEmail.trim()) {
      toast.error('신고자 이메일을 입력해주세요.');
      return;
    }

    if (!reason.trim()) {
      toast.error('신고 사유를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/public/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notionPageId,
          reporterEmail,
          reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '신고 제출에 실패했습니다.');
      }

      toast.success('신고가 정상 접수되었습니다.');
      setReporterEmail('');
      setReason('');
      setOpen(false);
    } catch (error) {
      console.error('Report submission error:', error);
      toast.error(error instanceof Error ? error.message : '신고 제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          'group/button inline-flex shrink-0 items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground shadow-xs transition-[background-color,color,border-color,box-shadow] hover:bg-muted active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 gap-2 w-full sm:w-auto'
        )}
      >
        <AlertTriangle className='h-4 w-4' />
        신고하기
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>견적서 신고</DialogTitle>
          <DialogDescription>
            문제가 있는 견적서를 신고해주세요. 관리자가 검토하겠습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='email' className='text-sm font-medium'>
              신고자 이메일 *
            </label>
            <Input
              id='email'
              type='email'
              placeholder='your@email.com'
              value={reporterEmail}
              onChange={(e) => setReporterEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='reason' className='text-sm font-medium'>
              신고 사유 *
            </label>
            <Textarea
              id='reason'
              placeholder='신고 사유를 자세히 입력해주세요...'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              disabled={isSubmitting}
              className='resize-none'
            />
            <p className='text-xs text-muted-foreground'>최대 1000자</p>
          </div>

          <div className='flex gap-3 justify-end pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type='submit' disabled={isSubmitting} className='gap-2'>
              {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
              신고 제출
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
