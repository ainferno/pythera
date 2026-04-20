import type { FormEvent, ReactNode } from 'react';
import { Button } from '../ui';
import { clinicLongDate, clinicTime } from '../../lib/clinic-tz';

type Props = {
  selectedSlot: string | null;
  notes: string;
  onNotesChange: (v: string) => void;
  onSubmit: () => void;
  pending: boolean;
  status?: ReactNode;
};

export function BookingForm({
  selectedSlot,
  notes,
  onNotesChange,
  onSubmit,
  pending,
  status,
}: Props) {
  function handle(e: FormEvent) {
    e.preventDefault();
    if (selectedSlot) onSubmit();
  }

  return (
    <form onSubmit={handle} className="flex flex-col gap-4">
      <div>
        <div className="text-xs uppercase tracking-[0.14em] text-[var(--color-muted)] mb-1">
          выбрано
        </div>
        <div className="text-lg font-medium min-h-7">
          {selectedSlot ? (
            <>
              {clinicLongDate(selectedSlot)}
              <span className="text-[var(--color-muted)]"> · </span>
              {clinicTime(selectedSlot)}
            </>
          ) : (
            <span className="text-[var(--color-muted)]">выберите день и время</span>
          )}
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-[var(--color-muted)]">комментарий (необязательно)</span>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={4}
          placeholder="коротко — что происходит, чего ждёте от встречи"
          className="p-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] outline-none resize-none"
        />
      </label>

      <Button type="submit" disabled={!selectedSlot || pending}>
        {pending ? 'отправляем…' : 'записаться на приём'}
      </Button>

      {status}
    </form>
  );
}
