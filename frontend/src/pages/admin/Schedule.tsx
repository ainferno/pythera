import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '../../api/admin';

const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export default function AdminSchedule() {
  const qc = useQueryClient();
  const tpls = useQuery({ queryKey: ['templates'], queryFn: adminApi.listTemplates });
  const blocks = useQuery({ queryKey: ['blocks'], queryFn: adminApi.listBlocks });

  const createTpl = useMutation({
    mutationFn: adminApi.createTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });
  const delTpl = useMutation({
    mutationFn: adminApi.deleteTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });
  const createBlock = useMutation({
    mutationFn: adminApi.createBlock,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocks'] }),
  });
  const delBlock = useMutation({
    mutationFn: adminApi.deleteBlock,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocks'] }),
  });

  const [tplForm, setTplForm] = useState({
    weekday: 1,
    start_time: '10:00',
    end_time: '18:00',
    slot_minutes: 60,
    is_active: true,
  });
  const [blockForm, setBlockForm] = useState({ starts_at: '', ends_at: '', reason: '' });

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section>
        <h2>Шаблон расписания (недельный)</h2>
        <ul>
          {tpls.data?.map((t) => (
            <li key={t.id}>
              {weekdays[t.weekday]} {t.start_time}–{t.end_time}, слот {t.slot_minutes} мин.{' '}
              {t.is_active ? '' : '(неактивен)'}{' '}
              <button onClick={() => delTpl.mutate(t.id)}>Удалить</button>
            </li>
          ))}
        </ul>
        <div style={{ display: 'grid', gap: 6, maxWidth: 400 }}>
          <select
            value={tplForm.weekday}
            onChange={(e) => setTplForm({ ...tplForm, weekday: Number(e.target.value) })}
          >
            {weekdays.map((d, i) => (
              <option key={i} value={i}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={tplForm.start_time}
            onChange={(e) => setTplForm({ ...tplForm, start_time: e.target.value })}
          />
          <input
            type="time"
            value={tplForm.end_time}
            onChange={(e) => setTplForm({ ...tplForm, end_time: e.target.value })}
          />
          <input
            type="number"
            min={15}
            step={15}
            value={tplForm.slot_minutes}
            onChange={(e) => setTplForm({ ...tplForm, slot_minutes: Number(e.target.value) })}
          />
          <button onClick={() => createTpl.mutate(tplForm)}>Добавить</button>
        </div>
      </section>

      <section>
        <h2>Блокировки (отпуск, перерыв)</h2>
        <ul>
          {blocks.data?.map((b) => (
            <li key={b.id}>
              {new Date(b.starts_at).toLocaleString('ru-RU')} — {new Date(b.ends_at).toLocaleString('ru-RU')}{' '}
              {b.reason && `(${b.reason})`}{' '}
              <button onClick={() => delBlock.mutate(b.id)}>Удалить</button>
            </li>
          ))}
        </ul>
        <div style={{ display: 'grid', gap: 6, maxWidth: 400 }}>
          <input
            type="datetime-local"
            value={blockForm.starts_at}
            onChange={(e) => setBlockForm({ ...blockForm, starts_at: e.target.value })}
          />
          <input
            type="datetime-local"
            value={blockForm.ends_at}
            onChange={(e) => setBlockForm({ ...blockForm, ends_at: e.target.value })}
          />
          <input
            placeholder="причина"
            value={blockForm.reason}
            onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
          />
          <button
            onClick={() =>
              createBlock.mutate({
                starts_at: new Date(blockForm.starts_at).toISOString(),
                ends_at: new Date(blockForm.ends_at).toISOString(),
                reason: blockForm.reason || undefined,
              })
            }
          >
            Добавить блокировку
          </button>
        </div>
      </section>
    </div>
  );
}
