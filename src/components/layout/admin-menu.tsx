'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings } from 'lucide-react';
import { toast } from 'sonner';

export function AdminMenu() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('로그아웃되었습니다.');
        router.push('/');
        router.refresh();
      } else {
        toast.error('로그아웃 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
      toast.error('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant='ghost' size='sm' className='gap-2'>
          <Settings className='h-4 w-4' />
          <span className='sr-only'>메뉴</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuItem disabled className='text-xs text-muted-foreground'>
          관리자 계정
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoading}
          className='gap-2 cursor-pointer text-destructive focus:text-destructive'
        >
          <LogOut className='h-4 w-4' />
          {isLoading ? '로그아웃 중...' : '로그아웃'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
