import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { bookingsApi } from '../../api/bookings';
import { Button, Container, SectionTitle, Status, cn } from '../../components/ui';
import { clinicLongDate, clinicTime } from '../../lib/clinic-tz';
import type { BookingStatus } from '../../api/types';

type Tab = 'all' | BookingStatus;

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'all',       label: 'все' },
  { id: 'pending',   label: 'ожидают' },
  { id: 'confirmed', label: 'подтверждены' },
  { id: 'completed', label: 'завершены' },
  { id: 'cancelled', label: 'отменены' },
];

const statusLabel: Record<BookingStatus, string> = {
  pending: 'ожидает',
  confirmed: 'подтверждена',
  cancelled: 'отменена',
  completed: 'завершена',
};
const statusTone: Record<BookingStatus, string> = {
  pending:   'bg-amber-100 text-amber-900',
  confirmed: 'bg-emerald-100 text-emerald-900',
  cancelled: 'bg-neutral-200 text-neutral-700',
  completed: 'bg-neutral-100 text-neutral-600',
};

export default function AdminDashboard() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('all');
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const status = tab === 'all' ? undefined : tab;
  const list = useQuery({
    queryKey: ['admin-bookings', status ?? 'all'],
    queryFn: () => adminApi.listBookings(status),
  });

  const confirm = useMutation({
    mutationFn: (id: string) => adminApi.confirmBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      setFeedback({ kind: 'success', text: 'Запись подтверждена, клиент получит письмо.' });
    },
    onError: (e: Error) =>
      setFeedback({ kind: 'error', text: e.message || 'Не удалось подтвердить' }),
  });
  const cancel = useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      setFeedback({ kind: 'success', text: 'Запись отменена.' });
    },
    onError: (e: Error) =>
      setFeedback({ kind: 'error', text: e.message || 'Не удалось отменить' }),
  });

  const rows = list.data ?? [];

  return (
    <Container className="py-10 md:py-16 flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionTitle eyebrow="админ" title="записи клиентов" />
        <Button variant="ghost" asChild size="sm">
          <Link to="/admin/schedule">управление расписанием →</Link>
        </Button>
      </div>

      {feedback && (
        <Status kind={feedback.kind} onClose={() => setFeedback(null)}>
          {feedback.text}
        </Status>
      )}

      <nav className="flex flex-wrap gap-2 border-b border-[var(--color-line)] -mb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={cn(
              'px-3 py-2 text-sm lowercase border-b-2 -mb-px transition',
              tab === t.id
                ? 'border-[var(--color-accent)] text-[var(--color-ink)]'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]',
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {list.isLoading && <p className="text-[var(--color-muted)]">загрузка…</p>}

      {!list.isLoading && rows.length === 0 && (
        <p className="text-[var(--color-muted)]">В этом статусе пусто.</p>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto border border-[var(--color-line)] rounded-2xl bg-[var(--color-surface)]">
          <table className="w-full text-sm">
            <thead className="text-left text-[var(--color-muted)] bg-[var(--color-bg)]">
              <tr>
                <th className="p-3 font-medium">время</th>
                <th className="p-3 font-medium">клиент</th>
                <th className="p-3 font-medium">статус</th>
                <th className="p-3 font-medium">комментарий</th>
                <th className="p-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-t border-[var(--color-line)] align-top">
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-medium">{clinicLongDate(b.slot_start)}</div>
                    <div className="text-[var(--color-muted)]">{clinicTime(b.slot_start)}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{b.client.full_name}</div>
                    <a
                      href={`mailto:${b.client.email}`}
                      className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] underline-offset-2 hover:underline"
                    >
                      {b.client.email}
                    </a>
                    {b.client.phone && (
                      <div>
                        <a
                          href={`tel:${b.client.phone}`}
                          className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                        >
                          {b.client.phone}
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        'inline-block text-xs font-medium px-2.5 py-1 rounded-full lowercase',
                        statusTone[b.status],
                      )}
                    >
                      {statusLabel[b.status]}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--color-muted)] max-w-sm">
                    <div className="line-clamp-3 whitespace-pre-wrap">{b.client_notes ?? '—'}</div>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {b.status === 'pending' && (
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          onClick={() => confirm.mutate(b.id)}
                          disabled={confirm.isPending}
                        >
                          подтвердить
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => cancel.mutate(b.id)}
                          disabled={cancel.isPending}
                        >
                          отклонить
                        </Button>
                      </div>
                    )}
                    {b.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cancel.mutate(b.id)}
                        disabled={cancel.isPending}
                      >
                        отменить
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}
