import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

type Props = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'>;

export function Card({ as: Tag = 'div', className, children, ...rest }: Props) {
  return (
    <Tag
      className={cn(
        'bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl p-5 md:p-6',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
