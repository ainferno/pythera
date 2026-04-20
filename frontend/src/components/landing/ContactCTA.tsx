import { Link } from 'react-router-dom';
import { Button, Container } from '../ui';

export function ContactCTA() {
  return (
    <section className="py-20 md:py-28 border-t border-[var(--color-line)]">
      <Container className="flex flex-col items-center text-center gap-6 max-w-[var(--container-prose)]">
        <h2 className="text-3xl md:text-5xl font-medium lowercase leading-tight">
          {/* TODO: согласовать с психологом */}
          готовы попробовать?<br />
          <span className="text-[var(--color-muted)]">первая встреча — бесплатно.</span>
        </h2>
        <p className="text-[var(--color-muted)] text-lg leading-relaxed">
          Выберите удобное время — я подтвержу заявку в течение дня.
        </p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Button asChild>
            <Link to="/booking">записаться</Link>
          </Button>
          <Button variant="ghost" asChild>
            {/* TODO: telegram handle */}
            <a href="https://t.me/" target="_blank" rel="noreferrer">
              написать в telegram
            </a>
          </Button>
        </div>
      </Container>
    </section>
  );
}
