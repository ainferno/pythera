import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'ghost' | 'link';
export type ButtonSize = 'md' | 'sm';

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
};

type AsButton = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    asChild?: false;
  };

type AsChild = Common & {
  asChild: true;
};

export type ButtonProps = AsButton | AsChild;

const base =
  'inline-flex items-center justify-center gap-2 font-medium transition ' +
  'disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap';

const sizes: Record<ButtonSize, string> = {
  md: 'h-11 px-5 text-[15px] rounded-xl',
  sm: 'h-9 px-3 text-sm rounded-lg',
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-accent)] text-[var(--color-accent-ink)] ' +
    'hover:bg-[var(--color-accent-hover)] active:translate-y-px',
  ghost:
    'bg-transparent text-[var(--color-ink)] border border-[var(--color-line)] ' +
    'hover:bg-[var(--color-ink)]/5',
  link:
    'bg-transparent text-[var(--color-ink)] underline-offset-4 hover:underline px-0 h-auto',
};

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className } = props;
  const classes = cn(base, variant !== 'link' && sizes[size], variants[variant], className);

  if ('asChild' in props && props.asChild) {
    const child = props.children;
    if (!isValidElement(child)) {
      throw new Error('<Button asChild> requires a single React element as child');
    }
    const el = child as ReactElement<{ className?: string }>;
    return cloneElement(el, { className: cn(classes, el.props.className) });
  }

  const { children, ...rest } = props as AsButton;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
