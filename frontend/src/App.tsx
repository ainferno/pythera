import type { ReactNode } from 'react';
import { Link, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminSchedule from './pages/admin/Schedule';

function RequireAuth({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Загрузка…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user, logout } = useAuth();
  return (
    <div>
      <nav style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #ddd' }}>
        <Link to="/">Главная</Link>
        <Link to="/booking">Записаться</Link>
        {user && <Link to="/profile">Мой профиль</Link>}
        {user?.role === 'admin' && <Link to="/admin">Админ</Link>}
        <div style={{ marginLeft: 'auto' }}>
          {user ? (
            <>
              <span>{user.full_name}</span>{' '}
              <button onClick={logout}>Выйти</button>
            </>
          ) : (
            <>
              <Link to="/login">Войти</Link> | <Link to="/register">Регистрация</Link>
            </>
          )}
        </div>
      </nav>
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking" element={<RequireAuth><Booking /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth admin><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/schedule" element={<RequireAuth admin><AdminSchedule /></RequireAuth>} />
        </Routes>
      </main>
    </div>
  );
}
