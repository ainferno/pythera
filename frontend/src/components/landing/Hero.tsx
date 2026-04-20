import { Link } from 'react-router-dom';
import { Button, Container } from '../ui';
import { StickyCTASentinel } from '../layout/MobileStickyCTA';

export function Hero() {
  return (
    <section className="pt-12 md:pt-20 pb-16 md:pb-24">
      <Container className="grid gap-10 md:grid-cols-[1.2fr_1fr] items-center">
        <div className="flex flex-col gap-6">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
            {/* TODO: согласовать с психологом */}
            психотерапия · онлайн · ru/en
          </span>

          <h1 className="text-4xl md:text-6xl font-medium leading-[1.05] lowercase">
            {/* TODO: согласовать с психологом */}
            загруженный ум?<br />
            <span className="text-[var(--color-muted)]">уберём лишнее —</span><br />
            останетесь собой.
          </h1>

          <p className="text-lg md:text-xl text-[var(--color-muted)] leading-relaxed max-w-[52ch]">
            {/* TODO: согласовать с психологом */}
            Индивидуальная терапия для тех, кто много думает, но мало делает.
            КПТ, схема-терапия — короткими понятными сессиями, онлайн.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link to="/booking">записаться на знакомство</Link>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#how">как это работает</a>
            </Button>
          </div>

          <ul className="flex flex-wrap gap-4 pt-4 text-sm text-[var(--color-muted)]">
            <li>50 минут</li>
            <li aria-hidden>·</li>
            <li>первая консультация — 0 ₽</li>
            <li aria-hidden>·</li>
            <li>конфиденциально</li>
          </ul>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
            <img
              src="/placeholders/about.svg"
              alt="Портрет психолога"
              loading="eager"
              fetchPriority="high"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </Container>
      <StickyCTASentinel />
    </section>
  );
}
