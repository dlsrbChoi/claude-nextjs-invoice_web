'use client';

/**
 * 이메일 공유 다이얼로그 (F033, Task 609)
 * 관리자가 견적서 공유 링크를 클라이언트에게 이메일로 발송하는 자기완결형 모달 컴포넌트.
 * "이메일로 공유" 버튼(트리거)과 Dialog를 함께 렌더링하므로 견적서 목록/상세 어디서든
 * <EmailShareDialog notionPageId=... defaultRecipientEmail=... /> 형태로 바로 사용할 수 있다.
 * 발송 로직은 lib/email.ts의 emailSender(스텁)와 validateEmailShareRequest를 그대로 재사용하며,
 * 실제 제공자 연동(Resend 등)은 Task 613에서 처리한다.
 */

import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Field, FieldLabel, FieldError, FieldGroup, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { emailSender, validateEmailShareRequest } from '@/lib/email';
import { EMAIL_SHARE_LIMITS, type EmailShareRequest } from '@/lib/types';

interface EmailShareDialogProps {
  /** 발송 대상 견적서의 Notion 페이지 ID */
  notionPageId: string;
  /** 수신자 이메일 기본값 (해당 견적서의 clientEmail, 사용자가 수정 가능) */
  defaultRecipientEmail: string;
  /** 다이얼로그 설명에 표시할 견적서 제목 (선택) */
  invoiceTitle?: string;
}

type SendStatus = 'idle' | 'sending' | 'success' | 'error';

/** 폼 초기값 생성 (수신자 이메일은 defaultRecipientEmail로 기본 채움) */
function buildInitialForm(defaultRecipientEmail: string): Omit<EmailShareRequest, 'notionPageId'> {
  return {
    recipientEmail: defaultRecipientEmail,
    subject: '견적서를 공유드립니다',
    message: '요청하신 견적서를 공유드립니다. 아래 링크에서 확인해 주세요.',
  };
}

export function EmailShareDialog({
  notionPageId,
  defaultRecipientEmail,
  invoiceTitle,
}: EmailShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => buildInitialForm(defaultRecipientEmail));
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<SendStatus>('idle');

  // 공유 링크는 클라이언트에서 현재 origin 기준으로 계산 (SSR에서는 상대 경로로 대체)
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/invoice/${notionPageId}`
      : `/invoice/${notionPageId}`;

  const resetForm = () => {
    setForm(buildInitialForm(defaultRecipientEmail));
    setErrors([]);
    setStatus('idle');
  };

  // Dialog가 닫힐 때(Esc, 배경 클릭, 취소 버튼 등 모든 경로) 폼 상태를 초기화한다.
  // base-ui Dialog는 포커스 트랩과 Esc 닫기를 기본 제공하므로 별도 구현이 필요 없다.
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const request: EmailShareRequest = { notionPageId, ...form };
    const validation = validateEmailShareRequest(request);

    if (!validation.valid) {
      setErrors(validation.errors);
      setStatus('error');
      return;
    }

    setErrors([]);
    setStatus('sending');

    const result = await emailSender.send(request, shareUrl);

    if (result.success) {
      setStatus('success');
      toast.success('이메일을 발송했습니다.');
      setOpen(false);
      resetForm();
    } else {
      // 실패 시 Dialog는 유지하여 재시도할 수 있게 한다.
      setStatus('error');
      const message = result.failureReason || '이메일 발송에 실패했습니다.';
      setErrors([message]);
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant='outline' size='sm' className='gap-2'>
            <Mail className='h-4 w-4' />
            이메일로 공유
          </Button>
        }
      />
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>이메일로 견적서 공유</DialogTitle>
            <DialogDescription>
              {invoiceTitle
                ? `"${invoiceTitle}" 견적서의 공유 링크를 이메일로 발송합니다.`
                : '견적서 공유 링크를 이메일로 발송합니다.'}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className='py-2'>
            <Field>
              <FieldLabel htmlFor='email-share-recipient'>수신자 이메일</FieldLabel>
              <Input
                id='email-share-recipient'
                type='email'
                value={form.recipientEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, recipientEmail: e.target.value }))}
                placeholder='client@example.com'
                required
                disabled={status === 'sending'}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor='email-share-subject'>제목</FieldLabel>
              <Input
                id='email-share-subject'
                value={form.subject}
                onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                maxLength={EMAIL_SHARE_LIMITS.SUBJECT_MAX_LENGTH}
                required
                disabled={status === 'sending'}
              />
              <FieldDescription>
                {form.subject.length}/{EMAIL_SHARE_LIMITS.SUBJECT_MAX_LENGTH}자
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor='email-share-message'>메시지</FieldLabel>
              <Textarea
                id='email-share-message'
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                placeholder='공유 링크는 자동으로 삽입되니, 안내 문구만 입력해주세요.'
                maxLength={EMAIL_SHARE_LIMITS.MESSAGE_MAX_LENGTH}
                rows={4}
                required
                disabled={status === 'sending'}
              />
              <FieldDescription>
                {form.message.length}/{EMAIL_SHARE_LIMITS.MESSAGE_MAX_LENGTH}자. 공유 링크는
                자동으로 본문에 삽입됩니다.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor='email-share-link'>공유 링크 미리보기</FieldLabel>
              <Input
                id='email-share-link'
                value={shareUrl}
                readOnly
                disabled
                className='font-mono text-xs'
              />
            </Field>

            {errors.length > 0 && (
              <FieldError>
                <ul className='ml-4 list-disc space-y-1'>
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </FieldError>
            )}
          </FieldGroup>

          <DialogFooter>
            <DialogClose
              render={<Button type='button' variant='outline' disabled={status === 'sending'} />}
            >
              취소
            </DialogClose>
            <Button type='submit' disabled={status === 'sending'} className='gap-2'>
              {status === 'sending' && <Loader2 className='h-4 w-4 animate-spin' />}
              {status === 'sending' ? '발송 중...' : '이메일 발송'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
