// The backend generates slots in CLINIC_TZ (Europe/Moscow by default) and
// serializes them in UTC. For calendar grouping we need to re-project each
// slot back into the clinic's wall-clock day — otherwise a 02:00 UTC slot on
// Thursday would render under Wednesday for a Moscow-based psychologist.
//
// Hardcoded here to match the backend env. If CLINIC_TZ ever becomes dynamic,
// expose it via a /api/config endpoint and read it at boot.

export const CLINIC_TZ = 'Europe/Moscow';

const dateFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: CLINIC_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const timeFmt = new Intl.DateTimeFormat('ru-RU', {
  timeZone: CLINIC_TZ,
  hour: '2-digit',
  minute: '2-digit',
});

const longDateFmt = new Intl.DateTimeFormat('ru-RU', {
  timeZone: CLINIC_TZ,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/** yyyy-mm-dd as seen in CLINIC_TZ — key for grouping slots by day. */
export function clinicDateKey(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return dateFmt.format(d);
}

/** HH:MM in CLINIC_TZ. */
export function clinicTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return timeFmt.format(d);
}

/** «понедельник, 22 апреля» in CLINIC_TZ. */
export function clinicLongDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return longDateFmt.format(d);
}

/** Convert a local calendar Date (midnight) into the same yyyy-mm-dd key. */
export function localDateKey(d: Date): string {
  // DayPicker returns a Date at local midnight; re-render it as if it were
  // already in the clinic zone so the key matches slot grouping.
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
