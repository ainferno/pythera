import { Link } from 'react-router-dom';
import { Container } from '../ui';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-[var(--color-line)] bg-[var(--color-bg)]">
      <Container className="py-12 grid gap-10 md:grid-cols-3 text-sm">
        <div>
          <div className="font-medium lowercase mb-2">саша · психолог</div>
          <p className="text-[var(--color-muted)] leading-relaxed">
            Индивидуальная психотерапия онлайн. КПТ / схема-терапия.
          </p>
        </div>
        <div>
          <div className="font-medium mb-2">Навигация</div>
          <ul className="flex flex-col gap-1 text-[var(--color-muted)]">
            <li><a href="/#issues"  className="hover:text-[var(--color-ink)]">что решаю</a></li>
            <li><a href="/#how"     className="hover:text-[var(--color-ink)]">как работает</a></li>
            <li><a href="/#pricing" className="hover:text-[var(--color-ink)]">стоимость</a></li>
            <li><a href="/#faq"     className="hover:text-[var(--color-ink)]">faq</a></li>
            <li><Link to="/booking" className="hover:text-[var(--color-ink)]">записаться</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2">Связь</div>
          <ul className="flex flex-col gap-1 text-[var(--color-muted)]">
            {/* TODO: согласовать с психологом */}
            <li>telegram: <a href="https://t.me/" className="hover:text-[var(--color-ink)]">@username</a></li>
            <li>email: <a href="mailto:hello@example.com" className="hover:text-[var(--color-ink)]">hello@example.com</a></li>
          </ul>
        </div>
      </Container>
      <Container className="pb-6 text-xs text-[var(--color-muted)] flex justify-between flex-col md:flex-row gap-2">
        <span>© {year}. Все права защищены.</span>
        <span>Сайт собран для демонстрации; дизайн временный.</span>
      </Container>
    </footer>
  );
}
