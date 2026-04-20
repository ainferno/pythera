import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from './cn';

type Kind = 'success' | 'error' | 'info';

type Props = {
  kind: Kind;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
};

const tones: Record<Kind, { border: string; bg: string; text: string; Icon: typeof Info }> = {
  success: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    Icon: CheckCircle2,
  },
  error: {
    border: 'border-[var(--color-accent)]/50',
    bg: 'bg-[var(--color-accent)]/5',
    text: 'text-[var(--color-ink)]',
    Icon: AlertCircle,
  },
  info: {
    border: 'border-[var(--color-line)]',
    bg: 'bg-[var(--color-surface)]',
    text: 'text-[var(--color-ink)]',
    Icon: Info,
  },
};

export function Status({ kind, children, onClose, className }: Props) {
  const { border, bg, text, Icon } = tones[kind];
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      aria-live={kind === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'flex items-start gap-3 rounded-xl border-l-4 border px-4 py-3 text-sm',
        border,
        bg,
        text,
        className,
      )}
    >
      <Icon size={18} className="shrink-0 mt-0.5" strokeWidth={1.8} />
      <div className="flex-1 leading-relaxed">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="shrink-0 p-0.5 -mr-1 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
