import { api } from './client';
import type { Booking, BookingStatus, ScheduleBlock, ScheduleTemplate } from './types';

export const adminApi = {
  listBookings: (status?: BookingStatus) =>
    api<Booking[]>(`/admin/bookings${status ? `?status=${status}` : ''}`),

  confirmBooking: (id: string, admin_notes?: string) =>
    api<Booking>(`/admin/bookings/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ admin_notes }),
    }),

  listTemplates: () => api<ScheduleTemplate[]>('/admin/schedule/templates'),

  createTemplate: (t: Omit<ScheduleTemplate, 'id' | 'admin_id'>) =>
    api<ScheduleTemplate>('/admin/schedule/templates', {
      method: 'POST',
      body: JSON.stringify(t),
    }),

  deleteTemplate: (id: string) =>
    api<void>(`/admin/schedule/templates/${id}`, { method: 'DELETE' }),

  listBlocks: () => api<ScheduleBlock[]>('/admin/schedule/blocks'),

  createBlock: (b: { starts_at: string; ends_at: string; reason?: string }) =>
    api<ScheduleBlock>('/admin/schedule/blocks', {
      method: 'POST',
      body: JSON.stringify(b),
    }),

  deleteBlock: (id: string) =>
    api<void>(`/admin/schedule/blocks/${id}`, { method: 'DELETE' }),
};
