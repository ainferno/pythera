import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await authApi.register({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        phone: form.phone || undefined,
      });
      await login(form.email, form.password);
      nav('/booking');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Ошибка регистрации');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 360, display: 'grid', gap: 8 }}>
      <h2>Регистрация</h2>
      <input placeholder="Имя" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
      <input placeholder="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input placeholder="телефон (необязательно)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <input placeholder="пароль (минимум 8 символов)" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
      {err && <div style={{ color: 'crimson' }}>{err}</div>}
      <button disabled={busy}>Зарегистрироваться</button>
    </form>
  );
}
