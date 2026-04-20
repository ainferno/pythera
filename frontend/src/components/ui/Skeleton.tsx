import type { HTMLAttributes } from 'react';
import { cn } from './cn';

type Variant = 'line' | 'block' | 'circle';

type Props = {
  variant?: Variant;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className'>;

const baseVariant: Record<Variant, string> = {
  line:   'h-4 rounded w-full',
  block:  'h-24 rounded-xl w-full',
  circle: 'h-10 w-10 rounded-full',
};

export function Skeleton({ variant = 'line', className, ...rest }: Props) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-[var(--color-line)]/70',
        baseVariant[variant],
        className,
      )}
      {...rest}
    />
  );
}

/**
 * Universal route-level loading fallback used by Suspense boundaries around
 * lazy-loaded pages. Keeps the shell stable while a chunk is being fetched.
 */
export function PageSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="w-full max-w-[var(--container-max)] mx-auto px-4 md:px-8 py-10 md:py-16 flex flex-col gap-4"
    >
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <Skeleton variant="block" className="h-64 mt-4" />
    </section>
  );
}
