import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <h1>Психолог — индивидуальные консультации</h1>
      <p>Здесь будет информация о психологе, подход, образование и отзывы (дизайн оформит дизайнер).</p>
      <p>
        <Link to="/booking">Записаться на приём →</Link>
      </p>
    </div>
  );
}
