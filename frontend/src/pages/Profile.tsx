import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings';
import { useAuth } from '../hooks/useAuth';
import type { Booking } from '../api/types';
import { Button, Card, Container, SectionTitle, cn } from '../components/ui';

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

export default function Profile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.mine(),
  });
  const cancel = useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-bookings'] }),
  });

  if (!user) return null;

  return (
    <Container className="py-10 md:py-16 flex flex-col gap-8">
      <SectionTitle
        eyebrow="профиль"
        title={user.full_name}
        subtitle={user.email}
      />

      <div>
        <h2 className="text-xl font-medium mb-4 lowercase">мои записи</h2>
        {list.isLoading && <p className="text-[var(--color-muted)]">загрузка…</p>}
        {list.data?.length === 0 && (
          <Card className="text-[var(--color-muted)]">Пока нет записей.</Card>
        )}
        <ul className="flex flex-col gap-3">
          {list.data?.map((b) => (
            <li key={b.id}>
              <Card className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="font-medium">
                    {new Date(b.slot_start).toLocaleString('ru-RU', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  {b.client_notes && (
                    <div className="text-sm text-[var(--color-muted)] mt-1">
                      {b.client_notes}
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium px-2.5 py-1 rounded-full lowercase',
                    statusTone[b.status],
                  )}
                >
                  {statusLabel[b.status]}
                </span>
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => cancel.mutate(b.id)}
                    disabled={cancel.isPending}
                  >
                    отменить
                  </Button>
                )}
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}
