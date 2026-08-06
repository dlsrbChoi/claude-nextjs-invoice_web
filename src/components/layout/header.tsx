'use client';

import { Container } from './container';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className='border-b border-border bg-background'>
      <Container className='flex h-16 items-center justify-between'>
        <h1 className='font-bold text-lg'>견적서 관리 시스템</h1>
        <ThemeToggle />
      </Container>
    </header>
  );
}
