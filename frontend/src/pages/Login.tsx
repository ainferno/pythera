import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, Card, Container } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email, password);
      nav('/');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Ошибка входа');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="py-16 md:py-24 max-w-md">
      <Card className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-medium lowercase">вход</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            нет аккаунта?{' '}
            <Link to="/register" className="underline underline-offset-4">
              зарегистрируйтесь
            </Link>
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-[var(--color-muted)]">email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 px-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-[var(--color-muted)]">пароль</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 px-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] outline-none"
            />
          </label>

          {err && <div className="text-sm text-[var(--color-accent)]">{err}</div>}

          <Button disabled={busy}>{busy ? 'входим…' : 'войти'}</Button>
        </form>
      </Card>
    </Container>
  );
}
