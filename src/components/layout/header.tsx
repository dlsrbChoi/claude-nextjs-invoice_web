'use client';

import { usePathname } from 'next/navigation';
import { Container } from './container';
import { ThemeToggle } from './theme-toggle';
import { AdminMenu } from './admin-menu';

export function Header() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <header className='border-b border-border bg-background'>
      <Container className='flex h-16 items-center justify-between'>
        <h1 className='font-bold text-lg'>견적서 관리 시스템</h1>
        <div className='flex items-center gap-4'>
          <ThemeToggle />
          {isAdmin && <AdminMenu />}
        </div>
      </Container>
    </header>
  );
}
