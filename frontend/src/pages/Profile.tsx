import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings';
import { useAuth } from '../hooks/useAuth';
import type { Booking } from '../api/types';
import { Button, Card, Container, SectionTitle, Skeleton, Status, cn } from '../components/ui';
import { clinicLongDate, clinicTime } from '../lib/clinic-tz';

const statusLabel: Record<Booking['status'], string> = {
  pending: 'ожидает подтверждения',
  confirmed: 'подтверждена',
  cancelled: 'отменена',
  completed: 'завершена',
};

const statusTone: Record<Booking['status'], string> = {
  pending:   'bg-amber-100 text-amber-900',
  confirmed: 'bg-emerald-100 text-emerald-900',
  cancelled: 'bg-neutral-200 text-neutral-700',
  completed: 'bg-neutral-100 text-neutral-600',
};

function isUpcoming(b: Booking): boolean {
  if (b.status !== 'pending' && b.status !== 'confirmed') return false;
  return new Date(b.slot_end).getTime() > Date.now();
}

export default function Profile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.mine(),
  });

  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const cancel = useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      setFeedback({ kind: 'success', text: 'Запись отменена.' });
    },
    onError: (e: Error) =>
      setFeedback({ kind: 'error', text: e.message || 'Не удалось отменить' }),
  });

  const { upcoming, past } = useMemo(() => {
    const all = list.data ?? [];
    return {
      upcoming: all.filter(isUpcoming),
      past: all.filter((b) => !isUpcoming(b)),
    };
  }, [list.data]);

  if (!user) return null;

  return (
    <Container className="py-10 md:py-16 flex flex-col gap-10">
      <SectionTitle eyebrow="профиль" title={user.full_name} subtitle={user.email} />

      {feedback && (
        <Status kind={feedback.kind} onClose={() => setFeedback(null)}>
          {feedback.text}
        </Status>
      )}

      {list.isLoading && (
        <div aria-busy="true" aria-live="polite" className="flex flex-col gap-3">
          <Skeleton variant="block" className="h-24" />
          <Skeleton variant="block" className="h-24" />
        </div>
      )}

      {!list.isLoading && (upcoming.length ?? 0) === 0 && (past.length ?? 0) === 0 && (
        <Card className="flex flex-col gap-3 items-start">
          <p className="text-[var(--color-muted)]">Пока нет записей.</p>
          <Button asChild>
            <Link to="/booking">записаться на приём</Link>
          </Button>
        </Card>
      )}

      {upcoming.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-medium lowercase">ближайшие</h2>
          <ul className="flex flex-col gap-3">
            {upcoming.map((b) => (
              <li key={b.id}>
                <Card className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium lowercase">
                      {clinicLongDate(b.slot_start)} · {clinicTime(b.slot_start)}
                    </div>
                    {b.client_notes && (
                      <div className="text-sm text-[var(--color-muted)] mt-1 break-words">
                        {b.client_notes}
                      </div>
                    )}
                  </div>
                  <span
                    className={cn(
                      'inline-block text-xs font-medium px-2.5 py-1 rounded-full lowercase self-start',
                      statusTone[b.status],
                    )}
                  >
                    {statusLabel[b.status]}
                  </span>
                  {confirmingId === b.id ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setConfirmingId(null)}>
                        нет
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setConfirmingId(null);
                          cancel.mutate(b.id);
                        }}
                        disabled={cancel.isPending}
                      >
                        да, отменить
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setConfirmingId(b.id)}>
                      отменить
                    </Button>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      {past.length > 0 && (
        <section className="flex flex-col gap-4">
          <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-between py-2 border-b border-[var(--color-line)]">
              <span className="text-lg font-medium lowercase">
                прошедшие записи · {past.length}
              </span>
              <span
                className="w-8 h-8 flex items-center justify-center text-[var(--color-muted)] transition-transform group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <ul className="flex flex-col gap-2 pt-4">
              {past.map((b) => (
                <li key={b.id}>
                  <Card className="flex items-center gap-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        {clinicLongDate(b.slot_start)} · {clinicTime(b.slot_start)}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium px-2.5 py-1 rounded-full lowercase',
                        statusTone[b.status],
                      )}
                    >
                      {statusLabel[b.status]}
                    </span>
                  </Card>
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}
    </Container>
  );
}
