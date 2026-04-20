import { api } from './client';
import type { Booking, Slot } from './types';

export const bookingsApi = {
  listSlots: (from?: string, to?: string) => {
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    const s = qs.toString();
    return api<Slot[]>(`/slots${s ? `?${s}` : ''}`);
  },

  create: (slot_start: string, notes?: string) =>
    api<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify({ slot_start, notes }),
    }),

  mine: () => api<Booking[]>('/bookings/mine'),

  cancel: (id: string) => api<Booking>(`/bookings/${id}/cancel`, { method: 'POST' }),

  reschedule: (id: string, slot_start: string) =>
    api<Booking>(`/bookings/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ slot_start }),
    }),
};
