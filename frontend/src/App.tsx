import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Footer, Header, MobileStickyCTA, SkipLink } from './components/layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminSchedule from './pages/admin/Schedule';

function RequireAuth({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-[var(--color-muted)]">
        Загрузка…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main" className="pb-28 md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking"  element={<RequireAuth><Booking /></RequireAuth>} />
          <Route path="/profile"  element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/admin"    element={<RequireAuth admin><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/schedule" element={<RequireAuth admin><AdminSchedule /></RequireAuth>} />
        </Routes>
      </main>
      <Footer />
      <MobileStickyCTA />
    </>
  );
}
