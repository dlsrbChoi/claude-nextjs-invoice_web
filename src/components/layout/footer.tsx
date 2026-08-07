import { Container } from './container';

export function Footer() {
  return (
    <footer className='border-t border-border bg-background'>
      <Container className='py-8'>
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            © 2026 노션 기반 견적서 관리 시스템. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
