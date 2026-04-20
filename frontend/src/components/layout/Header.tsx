import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button, Container, cn } from '../ui';

const anchors = [
  { href: '#issues',  label: 'что решаю' },
  { href: '#how',     label: 'как работает' },
  { href: '#pricing', label: 'стоимость' },
  { href: '#about',   label: 'обо мне' },
  { href: '#faq',     label: 'faq' },
];

export function Header() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const showAnchors = pathname === '/';

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg)]/85 backdrop-blur border-b border-[var(--color-line)]">
      <Container className="flex items-center gap-6 h-16">
        <Link to="/" className="font-medium tracking-tight lowercase" onClick={() => setOpen(false)}>
          саша · психолог
        </Link>

        {showAnchors && (
          <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--color-muted)]">
            {anchors.map((a) => (
              <a key={a.href} href={a.href} className="hover:text-[var(--color-ink)] transition">
                {a.label}
              </a>
            ))}
          </nav>
        )}

        <div className="hidden md:flex items-center gap-3 ml-auto">
          {user ? (
            <>
              <Link
                to="/profile"
                className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition"
              >
                мой профиль
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition"
                >
                  админ
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={logout}>
                выйти
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">войти</Link>
            </Button>
          )}
          <Button size="sm" asChild>
            <Link to="/booking">записаться</Link>
          </Button>
        </div>

        <button
          className="md:hidden ml-auto p-2 -mr-2"
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </Container>

      {/* mobile menu */}
      <div
        className={cn(
          'md:hidden border-t border-[var(--color-line)] overflow-hidden transition-[max-height]',
          open ? 'max-h-[420px]' : 'max-h-0',
        )}
      >
        <Container className="py-4 flex flex-col gap-3">
          {showAnchors &&
            anchors.map((a) => (
              <a
                key={a.href}
                href={a.href}
                onClick={() => setOpen(false)}
                className="py-1 text-[var(--color-muted)]"
              >
                {a.label}
              </a>
            ))}
          <div className="flex flex-col gap-2 pt-2">
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/profile" onClick={() => setOpen(false)}>мой профиль</Link>
                </Button>
                {user.role === 'admin' && (
                  <Button variant="ghost" asChild>
                    <Link to="/admin" onClick={() => setOpen(false)}>админ</Link>
                  </Button>
                )}
                <Button variant="ghost" onClick={() => { logout(); setOpen(false); }}>
                  выйти
                </Button>
              </>
            ) : (
              <Button variant="ghost" asChild>
                <Link to="/login" onClick={() => setOpen(false)}>войти</Link>
              </Button>
            )}
            <Button asChild>
              <Link to="/booking" onClick={() => setOpen(false)}>записаться</Link>
            </Button>
          </div>
        </Container>
      </div>
    </header>
  );
}
