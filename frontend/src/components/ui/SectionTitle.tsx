import type { ReactNode } from 'react';
import { cn } from './cn';

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
};

export function SectionTitle({ eyebrow, title, subtitle, align = 'left', className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 max-w-[var(--container-prose)]',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted)]">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-medium leading-tight lowercase">{title}</h2>
      {subtitle && (
        <p className="text-base md:text-lg text-[var(--color-muted)] leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
