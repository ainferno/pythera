import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { bookingsApi } from '../api/bookings';
import { Button, Card, Container, SectionTitle } from '../components/ui';

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Booking() {
  const qc = useQueryClient();
  const [notes, setNotes] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const slots = useQuery({
    queryKey: ['slots'],
    queryFn: () => bookingsApi.listSlots(),
  });

  const book = useMutation({
    mutationFn: (slot: string) => bookingsApi.create(slot, notes || undefined),
    onSuccess: () => {
      setSelected(null);
      setNotes('');
      qc.invalidateQueries({ queryKey: ['slots'] });
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      alert('Заявка отправлена. Психолог подтвердит запись по email.');
    },
    onError: (e: Error) => alert(`Ошибка: ${e.message}`),
  });

  const list = slots.data ?? [];

  return (
    <Container className="py-10 md:py-16 flex flex-col gap-8">
      <SectionTitle
        eyebrow="запись"
        title="выберите удобное время"
        subtitle="после заявки психолог подтвердит запись — вы получите письмо с деталями."
      />

      {slots.isLoading && <p className="text-[var(--color-muted)]">загружаем слоты…</p>}
      {slots.isError && <p className="text-[var(--color-accent)]">не удалось загрузить слоты</p>}

      {!slots.isLoading && list.length === 0 && (
        <Card className="text-[var(--color-muted)]">
          Сейчас нет свободных слотов. Загляните позже — расписание обновляется.
        </Card>
      )}

      {list.length > 0 && (
        <div className="grid gap-8 md:grid-cols-[1fr_320px] items-start">
          <ul className="grid gap-2 sm:grid-cols-2">
            {list.map((s) => {
              const active = selected === s.start;
              return (
                <li key={s.start}>
                  <button
                    type="button"
                    onClick={() => setSelected(s.start)}
                    className={
                      'w-full text-left px-4 h-12 rounded-xl border transition ' +
                      (active
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                        : 'border-[var(--color-line)] bg-[var(--color-surface)] hover:border-[var(--color-ink)]/30')
                    }
                    aria-pressed={active}
                  >
                    {fmt(s.start)}
                  </button>
                </li>
              );
            })}
          </ul>

          <Card className="md:sticky md:top-24 flex flex-col gap-4">
            <div className="text-sm text-[var(--color-muted)]">выбран слот</div>
            <div className="text-lg font-medium min-h-7">
              {selected ? fmt(selected) : '—'}
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-[var(--color-muted)]">комментарий (необязательно)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="коротко — что происходит, чего ждёте от встречи"
                className="p-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] outline-none resize-none"
              />
            </label>

            <Button
              disabled={!selected || book.isPending}
              onClick={() => selected && book.mutate(selected)}
            >
              {book.isPending ? 'отправляем…' : 'записаться'}
            </Button>
          </Card>
        </div>
      )}
    </Container>
  );
}
