import { api } from './client';
import type { User } from './types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  register: (body: { email: string; password: string; full_name: string; phone?: string }) =>
    api<User>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    api<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  me: () => api<User>('/me'),
};
