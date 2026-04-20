# therapy

Сайт-визитка для психолога + запись на приём.

- Бэкенд: Go + Echo + Postgres
- Фронтенд: React + TypeScript + Vite
- Оркестрация: Docker Compose

## Быстрый старт

```bash
cp .env.example .env
# отредактируйте .env: пароли БД, JWT_SECRET, ADMIN_EMAIL/ADMIN_PASSWORD, SMTP
make up        # или: docker compose up --build
```

- Фронт: http://localhost:5173
- API: http://localhost:8080/api
- Health-check: http://localhost:8080/api/health

При первом запуске, если `ADMIN_PASSWORD` задан в `.env`, автоматически создаётся аккаунт администратора (психолога). Войдите на сайт под `ADMIN_EMAIL` / `ADMIN_PASSWORD` и настройте расписание в разделе «Админ → Управление расписанием».

## Команды

На Windows без `make` используйте правую колонку:

| Make                 | Raw command                                                |
| -------------------- | ---------------------------------------------------------- |
| `make up`            | `docker compose up --build`                                |
| `make down`          | `docker compose down`                                      |
| `make logs`          | `docker compose logs -f`                                   |
| `make logs-backend`  | `docker compose logs -f backend`                           |
| `make psql`          | `docker compose exec db sh -c 'psql -U $POSTGRES_USER $POSTGRES_DB'` |
| `make tidy`          | `cd backend && go mod tidy` + `cd frontend && npm install` |
| `make backend-local` | `cd backend && go run ./cmd/server`                        |
| `make frontend-local`| `cd frontend && npm run dev`                               |
| `make clean`         | `docker compose down -v` (удаляет volume БД)               |

## Локальная разработка без Docker

Нужен запущенный Postgres (например, тот же `docker compose up db -d`).

```bash
# в одном терминале
cd backend
go mod tidy           # один раз
go run ./cmd/server

# в другом терминале
cd frontend
npm install           # один раз
npm run dev           # Vite на :5173 проксирует /api на :8080
```

Миграции применяются автоматически при старте бэкенда из `backend/migrations/`.

## E2E-проверка после запуска

1. **Health**: `curl http://localhost:8080/api/health` → должно вернуть `ok`.
2. Открыть http://localhost:5173 — главная страница видна.
3. Войти под `ADMIN_EMAIL`/`ADMIN_PASSWORD` из `.env` → **Админ → Управление расписанием** → добавить шаблон (например «Пн 10:00–18:00, слот 60 мин»).
4. Во второй сессии (инкогнито) зарегистрировать нового клиента.
5. Клиент → **Записаться** — видны сгенерированные слоты; выбрать один и отправить заявку.
6. Админ-сессия → **Админ** — новая запись в статусе `pending`; нажать «Подтвердить».
7. Клиент → **Мой профиль** — статус изменился на «Подтверждена».
8. Если SMTP настроен — проверить почту (письмо админу при создании, письмо клиенту при подтверждении). Если SMTP пустой, в логах бэка будет `smtp not configured; skipping email` — поток не ломается.

## Структура

- `backend/` — Go-сервис (Echo), слоистая архитектура, миграции.
- `frontend/` — React + TS SPA.
- `docker-compose.yml` — оркестрация.
- `CLAUDE.md` — архитектурные детали для будущих правок.
