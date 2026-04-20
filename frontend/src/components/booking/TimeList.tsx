import type { Slot } from '../../api/types';
import { clinicTime } from '../../lib/clinic-tz';
import { cn } from '../ui';

type Props = {
  slots: Slot[];
  selected: string | null;
  onPick: (iso: string) => void;
};

export function TimeList({ slots, selected, onPick }: Props) {
  if (slots.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        На этот день слотов нет — выберите другой.
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((s) => {
        const active = selected === s.start;
        return (
          <li key={s.start}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onPick(s.start)}
              className={cn(
                'w-full h-11 rounded-xl border text-sm font-medium transition',
                active
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 text-[var(--color-ink)]'
                  : 'border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-ink)]/30',
              )}
            >
              {clinicTime(s.start)}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
