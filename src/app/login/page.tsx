/**
 * 관리자 로그인 페이지
 * HTTP-only 세션 쿠키 기반 인증
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      toast.error('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        toast.success('로그인 성공했습니다.');
        router.push('/admin');
        router.refresh();
      } else if (response.status === 401) {
        toast.error('비밀번호가 잘못되었습니다.');
      } else {
        toast.error('로그인 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      toast.error('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-muted/50 py-12 px-4 sm:px-6 lg:px-8'>
      <Container className='w-full max-w-md'>
        <Card className='p-8'>
          <div className='space-y-6'>
            {/* 제목 */}
            <div className='text-center'>
              <div className='inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 mb-4'>
                <LogIn className='h-6 w-6 text-primary' />
              </div>
              <h1 className='text-2xl font-bold'>관리자 로그인</h1>
              <p className='text-sm text-muted-foreground mt-2'>
                견적서 관리 대시보드에 접근합니다.
              </p>
            </div>

            {/* 로그인 폼 */}
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <Label htmlFor='password' className='text-sm font-medium'>
                  비밀번호
                </Label>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='관리자 비밀번호를 입력하세요'
                  disabled={isLoading}
                  className='mt-1'
                  autoComplete='current-password'
                  required
                />
              </div>

              <Button type='submit' disabled={isLoading} className='w-full gap-2'>
                <LogIn className='h-4 w-4' />
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </form>

            {/* 안내 텍스트 */}
            <div className='rounded-lg bg-muted p-4 text-xs text-muted-foreground'>
              <p>
                <strong>테스트용 비밀번호:</strong> 환경 변수 ADMIN_PASSWORD 참고
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
