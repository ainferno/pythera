import { Container, SectionTitle } from '../ui';

// TODO: согласовать с психологом
const faq = [
  {
    q: 'как проходит онлайн-сессия?',
    a: 'встречаемся в zoom/google meet, 50 минут. нужен только ноутбук или телефон с камерой и тихое место. ссылку присылаю за час до встречи.',
  },
  {
    q: 'сколько нужно сессий, чтобы стало лучше?',
    a: 'зависит от запроса. в короткой работе (8–12 сессий) решаем конкретную задачу. в длинной — работаем с устойчивыми паттернами. сроки всегда обсуждаются на знакомстве.',
  },
  {
    q: 'а если я просто устал, это точно психолог?',
    a: 'да. психотерапия — не только про травмы. к ней приходят с выгоранием, скукой, усталостью, неясностью. ничего «слишком простого» не бывает.',
  },
  {
    q: 'конфиденциальность?',
    a: 'всё, что вы говорите, остаётся между нами. исключения — риск для вашей жизни или жизни других. разбираются заранее в первой сессии.',
  },
  {
    q: 'можно ли отменить или перенести?',
    a: 'да, за 24 часа — бесплатно. позже — сессия считается оплаченной. перенос в рамках абонемента — без сгорания.',
  },
  {
    q: 'принимаете пары?',
    a: 'не сейчас. работаю только индивидуально. если вам нужна парная терапия, порекомендую коллегу.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-24 border-t border-[var(--color-line)]">
      <Container className="grid gap-10 md:grid-cols-[1fr_1.4fr] items-start">
        <SectionTitle
          eyebrow="faq"
          title="частые вопросы"
          subtitle="если не нашли ответ — напишите в телеграм."
        />
        <ul className="flex flex-col divide-y divide-[var(--color-line)] border-t border-b border-[var(--color-line)]">
          {faq.map((item) => (
            <li key={item.q}>
              <details className="group py-5">
                <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                  <span className="font-medium text-base md:text-lg lowercase">{item.q}</span>
                  <span
                    className="w-8 h-8 flex items-center justify-center text-[var(--color-muted)] transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="pt-3 text-[var(--color-muted)] leading-relaxed max-w-[var(--container-prose)]">
                  {item.a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
