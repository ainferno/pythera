import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings';
import { useAuth } from '../hooks/useAuth';
import type { Booking } from '../api/types';

const statusLabel: Record<Booking['status'], string> = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтверждена',
  cancelled: 'Отменена',
  completed: 'Завершена',
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
    <div>
      <h2>Мой профиль</h2>
      <p>
        {user.full_name} — {user.email}
      </p>
      <h3>Мои записи</h3>
      {list.isLoading && <p>Загрузка…</p>}
      {list.data?.length === 0 && <p>Пока нет записей.</p>}
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
        {list.data?.map((b) => (
          <li key={b.id} style={{ padding: 8, border: '1px solid #eee' }}>
            <div>{new Date(b.slot_start).toLocaleString('ru-RU')}</div>
            <div>Статус: {statusLabel[b.status]}</div>
            {(b.status === 'pending' || b.status === 'confirmed') && (
              <button onClick={() => cancel.mutate(b.id)}>Отменить</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
