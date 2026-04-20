import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings';
import type { Slot } from '../api/types';
import { ApiError } from '../api/client';
import { Card, Container, SectionTitle, Status } from '../components/ui';
import { BookingCalendar, BookingForm, TimeList } from '../components/booking';
import { clinicDateKey, clinicLongDate, localDateKey } from '../lib/clinic-tz';

type Feedback = { kind: 'success' | 'error' | 'info'; text: string } | null;

export default function Booking() {
  const qc = useQueryClient();
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);

  const slotsQuery = useQuery({
    queryKey: ['slots'],
    queryFn: () => bookingsApi.listSlots(),
  });

  // Group slots by clinic-TZ date; first render auto-selects the nearest day.
  const { slotsByDay, datesWithSlots, firstDayWithSlots } = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slotsQuery.data ?? []) {
      const key = clinicDateKey(s.start);
      const arr = map.get(key);
      if (arr) arr.push(s);
      else map.set(key, [s]);
    }
    const keys = [...map.keys()].sort();
    const first = keys[0] ? parseDateKey(keys[0]) : undefined;
    return {
      slotsByDay: map,
      datesWithSlots: new Set(keys),
      firstDayWithSlots: first,
    };
  }, [slotsQuery.data]);

  const activeDay = selectedDay ?? firstDayWithSlots;
  const dayKey = activeDay ? localDateKey(activeDay) : null;
  const slotsForDay = dayKey ? slotsByDay.get(dayKey) ?? [] : [];

  const book = useMutation({
    mutationFn: (slot: string) => bookingsApi.create(slot, notes || undefined),
    onSuccess: () => {
      setSelectedSlot(null);
      setNotes('');
      qc.invalidateQueries({ queryKey: ['slots'] });
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      setFeedback({
        kind: 'success',
        text: 'Заявка отправлена. Психолог подтвердит запись, вы получите письмо.',
      });
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 409) {
        setSelectedSlot(null);
        qc.invalidateQueries({ queryKey: ['slots'] });
        setFeedback({
          kind: 'error',
          text: 'Этот слот только что заняли. Выберите другое время.',
        });
      } else {
        setFeedback({
          kind: 'error',
          text: e instanceof Error ? e.message : 'Не удалось отправить заявку',
        });
      }
    },
  });

  const today = useMemo(() => new Date(), []);
  const lookahead = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d;
  }, []);

  return (
    <Container className="py-10 md:py-16 flex flex-col gap-8">
      <SectionTitle
        eyebrow="запись"
        title="выберите удобное время"
        subtitle="после заявки психолог подтвердит запись — вы получите письмо с деталями."
      />

      {slotsQuery.isLoading && <p className="text-[var(--color-muted)]">загружаем расписание…</p>}
      {slotsQuery.isError && (
        <Status kind="error">Не удалось загрузить расписание. Попробуйте обновить страницу.</Status>
      )}

      {!slotsQuery.isLoading && !slotsQuery.isError && datesWithSlots.size === 0 && (
        <Card className="text-[var(--color-muted)]">
          Сейчас нет свободных слотов. Загляните позже — расписание регулярно обновляется.
        </Card>
      )}

      {datesWithSlots.size > 0 && (
        <div className="grid gap-8 md:grid-cols-[auto_1fr] items-start">
          <Card className="p-3 md:p-4">
            <BookingCalendar
              selected={activeDay}
              onSelect={(d) => {
                setSelectedDay(d);
                setSelectedSlot(null);
                setFeedback(null);
              }}
              datesWithSlots={datesWithSlots}
              minDate={today}
              maxDate={lookahead}
            />
          </Card>

          <div className="flex flex-col gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--color-muted)] mb-2">
                доступное время
              </div>
              {activeDay ? (
                <>
                  <div className="text-lg font-medium mb-3 lowercase">
                    {clinicLongDate(activeDay)}
                  </div>
                  <TimeList
                    slots={slotsForDay}
                    selected={selectedSlot}
                    onPick={(iso) => {
                      setSelectedSlot(iso);
                      setFeedback(null);
                    }}
                  />
                </>
              ) : (
                <p className="text-sm text-[var(--color-muted)]">
                  Выберите день в календаре.
                </p>
              )}
            </div>

            <Card>
              <BookingForm
                selectedSlot={selectedSlot}
                notes={notes}
                onNotesChange={setNotes}
                onSubmit={() => selectedSlot && book.mutate(selectedSlot)}
                pending={book.isPending}
                status={
                  feedback && (
                    <Status kind={feedback.kind} onClose={() => setFeedback(null)}>
                      {feedback.text}
                    </Status>
                  )
                }
              />
            </Card>
          </div>
        </div>
      )}
    </Container>
  );
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
