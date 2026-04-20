import { useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { ru } from 'date-fns/locale/ru';
import './day-picker.css';
import { localDateKey } from '../../lib/clinic-tz';

type Props = {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  datesWithSlots: Set<string>;   // yyyy-mm-dd keys
  minDate: Date;
  maxDate: Date;
};

export function BookingCalendar({
  selected,
  onSelect,
  datesWithSlots,
  minDate,
  maxDate,
}: Props) {
  const hasSlotsMatcher = useMemo(
    () => (date: Date) => datesWithSlots.has(localDateKey(date)),
    [datesWithSlots],
  );

  const disabledMatcher = useMemo(
    () => (date: Date) => !datesWithSlots.has(localDateKey(date)),
    [datesWithSlots],
  );

  return (
    <DayPicker
      mode="single"
      locale={ru}
      weekStartsOn={1}
      selected={selected}
      onSelect={onSelect}
      disabled={disabledMatcher}
      modifiers={{ hasSlots: hasSlotsMatcher }}
      modifiersClassNames={{ hasSlots: 'has-slots' }}
      startMonth={minDate}
      endMonth={maxDate}
      showOutsideDays
    />
  );
}
