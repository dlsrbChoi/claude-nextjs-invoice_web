import { Skeleton } from '@/components/ui/skeleton';
import { Container } from '@/components/layout/container';

export default function Loading() {
  return (
    <Container className='py-20'>
      <Skeleton className='h-12 w-1/3 mb-4' />
      <Skeleton className='h-4 w-2/3 mb-8' />
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className='h-40' />
        ))}
      </div>
    </Container>
  );
}
