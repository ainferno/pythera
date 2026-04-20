import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { Button, Card, Container, Status } from '../components/ui';

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

  const inputCls =
    'h-11 px-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] outline-none';

  return (
    <Container className="py-16 md:py-24 max-w-md">
      <Card className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-medium lowercase">регистрация</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            уже есть аккаунт?{' '}
            <Link to="/login" className="underline underline-offset-4">
              войдите
            </Link>
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-[var(--color-muted)]">имя</span>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-[var(--color-muted)]">email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-[var(--color-muted)]">телефон (необязательно)</span>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-[var(--color-muted)]">пароль (минимум 8 символов)</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
              className={inputCls}
            />
          </label>

          {err && <Status kind="error" onClose={() => setErr(null)}>{err}</Status>}

          <Button disabled={busy}>{busy ? 'регистрируем…' : 'зарегистрироваться'}</Button>
        </form>
      </Card>
    </Container>
  );
}
