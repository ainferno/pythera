import { Link } from 'react-router-dom';
import { Button, Card, Container, SectionTitle } from '../ui';

// TODO: согласовать с психологом — финальные цены и состав пакетов
const plans = [
  {
    name: 'знакомство',
    price: 'бесплатно',
    duration: '15 минут',
    features: [
      'короткий созвон по видео',
      'расскажете, что беспокоит',
      'я отвечаю — подхожу ли вам',
    ],
    highlight: false,
  },
  {
    name: 'разовая сессия',
    price: '4 500 ₽',
    duration: '50 минут',
    features: [
      'индивидуальный запрос',
      'подход: КПТ / схема-терапия',
      'после сессии — короткое резюме',
    ],
    highlight: true,
  },
  {
    name: 'абонемент',
    price: '16 000 ₽',
    duration: '4 сессии',
    features: [
      'фиксированное время каждую неделю',
      'экономия 2 000 ₽',
      'перенос без сгорания',
    ],
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-16 md:py-24 border-t border-[var(--color-line)]">
      <Container className="flex flex-col gap-10">
        <SectionTitle
          eyebrow="стоимость"
          title="прозрачные цены, без скрытых пакетов"
          subtitle="все суммы — за индивидуальную работу. оплата рублями, перевод на карту. чек по запросу."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.name}
              className={
                p.highlight
                  ? 'border-[var(--color-accent)]/40 ring-1 ring-[var(--color-accent)]/20'
                  : ''
              }
            >
              <div className="flex flex-col gap-5 h-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium lowercase text-xl">{p.name}</h3>
                  <span className="text-xs text-[var(--color-muted)]">{p.duration}</span>
                </div>
                <div className="text-3xl font-medium">{p.price}</div>
                <ul className="flex flex-col gap-2 text-[var(--color-muted)] text-sm leading-relaxed">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-[var(--color-accent)]" aria-hidden>·</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-2">
                  <Button
                    asChild
                    variant={p.highlight ? 'primary' : 'ghost'}
                    className="w-full"
                  >
                    <Link to="/booking">записаться</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
