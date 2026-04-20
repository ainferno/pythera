import { Suspense, lazy } from 'react';
import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import {
  Footer,
  Header,
  MobileStickyCTA,
  ResettableBoundary,
  SkipLink,
} from './components/layout';
import { PageSkeleton } from './components/ui';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Heavy routes are code-split so unauthenticated landing visitors don't pay
// the cost of the calendar picker or admin surface.
const Booking        = lazy(() => import('./pages/Booking'));
const Profile        = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminSchedule  = lazy(() => import('./pages/admin/Schedule'));

function RequireAuth({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <PageSkeleton />;
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
        <ResettableBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/booking"  element={<RequireAuth><Booking /></RequireAuth>} />
              <Route path="/profile"  element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/admin"    element={<RequireAuth admin><AdminDashboard /></RequireAuth>} />
              <Route path="/admin/schedule" element={<RequireAuth admin><AdminSchedule /></RequireAuth>} />
            </Routes>
          </Suspense>
        </ResettableBoundary>
      </main>
      <Footer />
      <MobileStickyCTA />
    </>
  );
}
