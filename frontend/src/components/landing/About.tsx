import { Container, SectionTitle } from '../ui';

export function About() {
  return (
    <section id="about" className="py-16 md:py-24 bg-[var(--color-surface)] border-y border-[var(--color-line)]">
      <Container className="grid gap-10 md:grid-cols-[1fr_1.2fr] items-center">
        <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)]">
          <img
            src="/placeholders/about.svg"
            alt="Портрет психолога — о себе"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-6">
          <SectionTitle
            eyebrow="обо мне"
            title="просто саша"
            subtitle="работаю с 2019 года. учусь, супервизируюсь, не верю в волшебные таблетки."
          />

          {/* TODO: согласовать с психологом */}
          <div className="flex flex-col gap-3 text-[var(--color-muted)] leading-relaxed">
            <p>
              Окончила психфак МГУ, магистратура по клинической психологии.
              Дополнительное образование — КПТ и схема-терапия, сейчас в процессе сертификации.
            </p>
            <p>
              Моя цель — сделать так, чтобы терапия вам стала не нужна.
              Помогаю разобрать, что мешает, и перевести инсайты в конкретные действия.
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-4 pt-2 text-sm">
            <li className="flex flex-col border-t border-[var(--color-line)] pt-3">
              <span className="text-[var(--color-muted)] text-xs uppercase tracking-wider mb-1">опыт</span>
              <span className="font-medium">5+ лет практики</span>
            </li>
            <li className="flex flex-col border-t border-[var(--color-line)] pt-3">
              <span className="text-[var(--color-muted)] text-xs uppercase tracking-wider mb-1">подход</span>
              <span className="font-medium">КПТ · схема-терапия</span>
            </li>
            <li className="flex flex-col border-t border-[var(--color-line)] pt-3">
              <span className="text-[var(--color-muted)] text-xs uppercase tracking-wider mb-1">клиентов</span>
              <span className="font-medium">80+</span>
            </li>
            <li className="flex flex-col border-t border-[var(--color-line)] pt-3">
              <span className="text-[var(--color-muted)] text-xs uppercase tracking-wider mb-1">формат</span>
              <span className="font-medium">онлайн · ru / en</span>
            </li>
          </ul>
        </div>
      </Container>
    </section>
  );
}
