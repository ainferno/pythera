import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Container } from '../ui';

/**
 * Registers a sentinel via window.__therapyStickySentinel so the landing Hero
 * can declare its end-of-section marker. Visible only on small viewports and
 * only after the sentinel scrolls off-screen.
 */
type SentinelRegistry = {
  set: (el: Element | null) => void;
};

declare global {
  interface Window {
    __therapyStickySentinel?: SentinelRegistry;
  }
}

export function MobileStickyCTA() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const obsRef = useRef<IntersectionObserver | null>(null);
  const currentEl = useRef<Element | null>(null);

  useEffect(() => {
    obsRef.current = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    window.__therapyStickySentinel = {
      set: (el) => {
        if (currentEl.current) obsRef.current?.unobserve(currentEl.current);
        currentEl.current = el;
        if (el) obsRef.current?.observe(el);
        else setVisible(false);
      },
    };
    return () => {
      obsRef.current?.disconnect();
      delete window.__therapyStickySentinel;
    };
  }, []);

  // Only show on the landing page.
  if (pathname !== '/' || !visible) return null;

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-30 pb-[env(safe-area-inset-bottom)] pointer-events-none">
      <div className="bg-[var(--color-bg)]/95 backdrop-blur border-t border-[var(--color-line)] pointer-events-auto">
        <Container className="py-3">
          <Button asChild className="w-full">
            <Link to="/booking">записаться на приём</Link>
          </Button>
        </Container>
      </div>
    </div>
  );
}

/** Sentinel element to be placed at the end of Hero. */
export function StickyCTASentinel() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const api = window.__therapyStickySentinel;
    api?.set(ref.current);
    return () => api?.set(null);
  }, []);
  return <div ref={ref} aria-hidden="true" className="h-px w-full" />;
}
