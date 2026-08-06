'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-12 text-center'>
      <Icon className='h-12 w-12 text-muted-foreground mb-4' />
      <h3 className='text-lg font-semibold mb-2'>{title}</h3>
      {description && <p className='text-muted-foreground mb-6 max-w-sm'>{description}</p>}
      {action && (
        <div>
          {action.href ? (
            <Link href={action.href}>
              <Button>{action.label}</Button>
            </Link>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  );
}
