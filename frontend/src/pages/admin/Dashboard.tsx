import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { Button, Container, SectionTitle, cn } from '../../components/ui';
import type { Booking } from '../../api/types';

const statusLabel: Record<Booking['status'], string> = {
  pending: 'ожидает',
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

export default function AdminDashboard() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => adminApi.listBookings(),
  });
  const confirm = useMutation({
    mutationFn: (id: string) => adminApi.confirmBooking(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-bookings'] }),
  });

  return (
    <Container className="py-10 md:py-16 flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionTitle eyebrow="админ" title="записи клиентов" />
        <Button variant="ghost" asChild size="sm">
          <Link to="/admin/schedule">управление расписанием →</Link>
        </Button>
      </div>

      {list.isLoading && <p className="text-[var(--color-muted)]">загрузка…</p>}

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
            {list.data?.map((b) => (
              <tr key={b.id} className="border-t border-[var(--color-line)]">
                <td className="p-3 whitespace-nowrap">
                  {new Date(b.slot_start).toLocaleString('ru-RU')}
                </td>
                <td className="p-3 font-mono text-xs text-[var(--color-muted)]">
                  {b.client_id.slice(0, 8)}…
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
                <td className="p-3 text-[var(--color-muted)] max-w-sm truncate">
                  {b.client_notes ?? '—'}
                </td>
                <td className="p-3 text-right">
                  {b.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => confirm.mutate(b.id)}
                      disabled={confirm.isPending}
                    >
                      подтвердить
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
