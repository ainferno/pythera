import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

type ContainerProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'>;

export function Container({ as: Tag = 'div', className, children, ...rest }: ContainerProps) {
  return (
    <Tag
      className={cn('w-full max-w-[var(--container-max)] mx-auto px-4 md:px-8', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
