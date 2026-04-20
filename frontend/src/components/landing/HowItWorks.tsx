import { Link } from 'react-router-dom';
import { CalendarCheck, MessageCircleHeart, Compass } from 'lucide-react';
import { Button, Container, SectionTitle } from '../ui';

// TODO: согласовать с психологом
const steps = [
  {
    icon: CalendarCheck,
    title: 'заявка',
    body: 'выбираете удобное время, оставляете короткий комментарий. я подтверждаю в течение дня.',
  },
  {
    icon: MessageCircleHeart,
    title: 'знакомство',
    body: '15-минутный созвон бесплатно: расскажете, что беспокоит, я отвечу, подхожу ли вам.',
  },
  {
    icon: Compass,
    title: 'регулярная работа',
    body: 'встречаемся раз в неделю по 50 минут. формат, темп и длительность — по вашему запросу.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-16 md:py-24 bg-[var(--color-surface)] border-y border-[var(--color-line)]">
      <Container className="flex flex-col gap-12">
        <SectionTitle
          eyebrow="как работает"
          title="три шага — и вы уже в терапии"
        />

        <ol className="grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-bg)] border border-[var(--color-line)]">
                  <s.icon size={20} strokeWidth={1.5} />
                </div>
                <span className="text-sm text-[var(--color-muted)]">{`0${i + 1}`}</span>
              </div>
              <h3 className="text-xl font-medium lowercase">{s.title}</h3>
              <p className="text-[var(--color-muted)] leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>

        <div>
          <Button asChild>
            <Link to="/booking">записаться на знакомство</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
