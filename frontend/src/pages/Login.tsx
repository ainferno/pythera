import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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
    <form onSubmit={onSubmit} style={{ maxWidth: 360, display: 'grid', gap: 8 }}>
      <h2>Вход</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" type="email" required />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="пароль" type="password" required />
      {err && <div style={{ color: 'crimson' }}>{err}</div>}
      <button disabled={busy}>Войти</button>
    </form>
  );
}
