import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { bookingsApi } from '../api/bookings';

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

  if (slots.isLoading) return <p>Загрузка…</p>;
  if (slots.isError) return <p>Не удалось загрузить слоты</p>;

  const list = slots.data ?? [];
  return (
    <div>
      <h2>Свободное время</h2>
      {list.length === 0 && <p>Нет свободных слотов.</p>}
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 6 }}>
        {list.map((s) => (
          <li key={s.start}>
            <label>
              <input
                type="radio"
                name="slot"
                checked={selected === s.start}
                onChange={() => setSelected(s.start)}
              />{' '}
              {fmt(s.start)}
            </label>
          </li>
        ))}
      </ul>
      {selected && (
        <div style={{ marginTop: 16, display: 'grid', gap: 8, maxWidth: 400 }}>
          <textarea
            placeholder="Комментарий к записи (необязательно)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <button disabled={book.isPending} onClick={() => book.mutate(selected)}>
            Записаться на {fmt(selected)}
          </button>
        </div>
      )}
    </div>
  );
}
