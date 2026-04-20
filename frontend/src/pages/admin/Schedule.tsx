import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '../../api/admin';
import { Button, Card, Container, SectionTitle } from '../../components/ui';

const weekdays = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

const inputCls =
  'h-10 px-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] outline-none';

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
    <Container className="py-10 md:py-16 flex flex-col gap-12">
      <SectionTitle eyebrow="админ · расписание" title="шаблон недели и блокировки" />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium lowercase">недельный шаблон</h2>
        {tpls.data?.length === 0 && (
          <p className="text-[var(--color-muted)] text-sm">пока пусто — добавьте первую полосу доступности.</p>
        )}
        <ul className="flex flex-col gap-2">
          {tpls.data?.map((t) => (
            <li key={t.id}>
              <Card className="flex items-center gap-3 justify-between">
                <div>
                  <span className="font-medium">{weekdays[t.weekday]}</span>{' '}
                  <span>{t.start_time}–{t.end_time}</span>{' '}
                  <span className="text-[var(--color-muted)] text-sm">слот {t.slot_minutes} мин</span>
                  {!t.is_active && (
                    <span className="text-xs text-[var(--color-muted)] ml-2">(неактивен)</span>
                  )}
                </div>
                <Button size="sm" variant="ghost" onClick={() => delTpl.mutate(t.id)}>
                  удалить
                </Button>
              </Card>
            </li>
          ))}
        </ul>

        <Card className="flex flex-col gap-3 max-w-lg">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-[var(--color-muted)]">день</span>
              <select
                value={tplForm.weekday}
                onChange={(e) => setTplForm({ ...tplForm, weekday: Number(e.target.value) })}
                className={inputCls}
              >
                {weekdays.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-[var(--color-muted)]">слот, мин</span>
              <input
                type="number"
                min={15}
                step={15}
                value={tplForm.slot_minutes}
                onChange={(e) => setTplForm({ ...tplForm, slot_minutes: Number(e.target.value) })}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-[var(--color-muted)]">с</span>
              <input
                type="time"
                value={tplForm.start_time}
                onChange={(e) => setTplForm({ ...tplForm, start_time: e.target.value })}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-[var(--color-muted)]">до</span>
              <input
                type="time"
                value={tplForm.end_time}
                onChange={(e) => setTplForm({ ...tplForm, end_time: e.target.value })}
                className={inputCls}
              />
            </label>
          </div>
          <Button onClick={() => createTpl.mutate(tplForm)} disabled={createTpl.isPending}>
            добавить полосу
          </Button>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium lowercase">блокировки</h2>
        {blocks.data?.length === 0 && (
          <p className="text-[var(--color-muted)] text-sm">нет блокировок — добавьте, если уезжаете или берёте выходной.</p>
        )}
        <ul className="flex flex-col gap-2">
          {blocks.data?.map((b) => (
            <li key={b.id}>
              <Card className="flex items-center gap-3 justify-between">
                <div className="text-sm">
                  <div>
                    {new Date(b.starts_at).toLocaleString('ru-RU')} —{' '}
                    {new Date(b.ends_at).toLocaleString('ru-RU')}
                  </div>
                  {b.reason && (
                    <div className="text-[var(--color-muted)] text-xs mt-0.5">{b.reason}</div>
                  )}
                </div>
                <Button size="sm" variant="ghost" onClick={() => delBlock.mutate(b.id)}>
                  удалить
                </Button>
              </Card>
            </li>
          ))}
        </ul>

        <Card className="flex flex-col gap-3 max-w-lg">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-muted)]">начало</span>
            <input
              type="datetime-local"
              value={blockForm.starts_at}
              onChange={(e) => setBlockForm({ ...blockForm, starts_at: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-muted)]">конец</span>
            <input
              type="datetime-local"
              value={blockForm.ends_at}
              onChange={(e) => setBlockForm({ ...blockForm, ends_at: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-muted)]">причина (опционально)</span>
            <input
              value={blockForm.reason}
              onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
              className={inputCls}
            />
          </label>
          <Button
            onClick={() =>
              createBlock.mutate({
                starts_at: new Date(blockForm.starts_at).toISOString(),
                ends_at: new Date(blockForm.ends_at).toISOString(),
                reason: blockForm.reason || undefined,
              })
            }
            disabled={createBlock.isPending || !blockForm.starts_at || !blockForm.ends_at}
          >
            добавить блокировку
          </Button>
        </Card>
      </section>
    </Container>
  );
}
