import { Container, SectionTitle } from '../ui';

// TODO: согласовать с психологом
const items = [
  { title: 'тревога', body: 'повышенная тревожность, панические атаки, страхи без опоры' },
  { title: 'выгорание', body: 'перегруз, апатия, невозможность отдохнуть и восстановиться' },
  { title: 'отношения', body: 'созависимость, конфликты, границы, расставания' },
  { title: 'самооценка', body: 'самокритика, перфекционизм, синдром самозванца' },
  { title: 'прокрастинация', body: 'много планов, мало действий — застревание в идеях' },
  { title: 'перемены', body: 'кризисы, переезд, смена работы, адаптация' },
];

export function Issues() {
  return (
    <section id="issues" className="py-16 md:py-24 border-t border-[var(--color-line)]">
      <Container className="flex flex-col gap-10">
        <SectionTitle
          eyebrow="что решаю"
          title="темы, с которыми приходят чаще всего"
          subtitle="работаю не со списком диагнозов, а с конкретными запросами. ниже — то, о чём говорим чаще всего."
        />
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <li
              key={it.title}
              className="border-t border-[var(--color-line)] pt-5"
            >
              <div className="font-medium text-lg lowercase mb-1">{it.title}</div>
              <p className="text-[var(--color-muted)] leading-relaxed">{it.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
