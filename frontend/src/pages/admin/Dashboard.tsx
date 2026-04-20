import type { CSSProperties } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';

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
    <div>
      <h2>Админ — записи</h2>
      <p>
        <Link to="/admin/schedule">Управление расписанием →</Link>
      </p>
      {list.isLoading && <p>Загрузка…</p>}
      <table style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Время</th>
            <th style={th}>Клиент</th>
            <th style={th}>Статус</th>
            <th style={th}>Комментарий</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {list.data?.map((b) => (
            <tr key={b.id}>
              <td style={td}>{new Date(b.slot_start).toLocaleString('ru-RU')}</td>
              <td style={td}>{b.client_id.slice(0, 8)}…</td>
              <td style={td}>{b.status}</td>
              <td style={td}>{b.client_notes ?? '—'}</td>
              <td style={td}>
                {b.status === 'pending' && (
                  <button onClick={() => confirm.mutate(b.id)}>Подтвердить</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: CSSProperties = { textAlign: 'left', padding: 6, borderBottom: '1px solid #ccc' };
const td: CSSProperties = { padding: 6, borderBottom: '1px solid #eee' };
