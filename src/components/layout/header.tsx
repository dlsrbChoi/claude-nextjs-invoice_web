'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from './container';
import { ThemeToggle } from './theme-toggle';
import { AdminMenu } from './admin-menu';
import { Button } from '@/components/ui/button';

export function Header() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <header className='border-b border-border bg-background'>
      <Container className='flex h-16 items-center justify-between'>
        <Link href='/' className='hover:opacity-80 transition-opacity'>
          <h1 className='font-bold text-lg'>견적서 관리 시스템</h1>
        </Link>
        <div className='flex items-center gap-4'>
          <ThemeToggle />
          {!isAdmin && (
            <Link href='/login'>
              <Button variant='outline' size='sm'>
                관리자 로그인
              </Button>
            </Link>
          )}
          {isAdmin && <AdminMenu />}
        </div>
      </Container>
    </header>
  );
}
