export type Role = 'client' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  client_id: string;
  admin_id: string;
  slot_start: string;
  slot_end: string;
  status: BookingStatus;
  client_notes?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Slot {
  start: string;
  end: string;
}

export interface ClientSummary {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
}

export interface AdminBooking extends Booking {
  client: ClientSummary;
}

export interface ScheduleTemplate {
  id: string;
  admin_id: string;
  weekday: number; // 0 = Sunday
  start_time: string; // "HH:MM"
  end_time: string;
  slot_minutes: number;
  is_active: boolean;
}

export interface ScheduleBlock {
  id: string;
  admin_id: string;
  starts_at: string;
  ends_at: string;
  reason?: string | null;
  created_at: string;
}
