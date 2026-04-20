# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-practitioner psychologist booking site. Public-facing business card + client auth + slot booking. One Postgres DB, one Go backend, one React SPA, all orchestrated via Docker Compose. UI copy is in Russian.

## Stack

- **Backend**: Go 1.22, `github.com/labstack/echo/v4`, `pgx/v5`, `golang-migrate/v4`, `golang-jwt/v5`, `bcrypt`. Plain `net/smtp` for email.
- **Frontend**: Vite + React 18 + TypeScript + React Router v6 + TanStack Query. No UI library yet — a designer will style later; keep markup semantic.
- **DB**: Postgres 16 (extensions: `pgcrypto`, `citext`).

## High-level architecture

**Layering** (backend, `backend/internal/`):

```
handlers  → HTTP (Echo). Parse/validate requests, map service errors to HTTP codes.
middleware→ JWT parsing + admin-only guard. Puts uuid/role into echo.Context.
service   → Business logic. Owns the rules (slot validity, booking transitions, emails).
repository→ All SQL. Accepts *pgxpool.Pool; returns models or ErrNotFound.
models    → Plain structs, shared across layers.
config    → Env loading + derived DSN, clinic timezone, JWT config.
database  → pgx pool + golang-migrate (runs `Up()` from `./migrations` on startup).
server    → Echo wiring: middleware chain, route groups.
cmd/server→ Composition root + admin bootstrap.
```

**Dependency direction is strictly downward** (handlers → service → repository → DB). Handlers never touch the pool or the repo directly unless doing pure read-through (e.g. `handlers/slots.go` calls `repository.UserRepo.GetAdmin` to discover the single admin; that's intentional).

**Admin model**: the app assumes exactly one admin (the psychologist). `UserRepo.GetAdmin()` returns the oldest admin. If adding multi-practitioner support later, endpoints that implicitly pick "the admin" (`/api/slots`, booking creation) need an `admin_id` parameter.

**Admin bootstrap**: on startup `cmd/server/main.go` calls `bootstrapAdmin`. If no admin row exists AND `ADMIN_PASSWORD` is set, it creates one from `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_FULL_NAME`. Otherwise you must promote a user manually: `UPDATE users SET role='admin' WHERE email=…;`.

## The slot model (important)

Availability is **computed, not stored**:

- `schedule_templates` — recurring weekly availability (`weekday`, `start_time`, `end_time`, `slot_minutes`). Configured by the admin.
- `schedule_blocks` — absolute time ranges that remove availability (vacation, sick days).
- `bookings` — actual reservations with status `pending | confirmed | cancelled | completed`.

`service.ScheduleService.AvailableSlots(from, to)` is the generator:

1. Iterate every day in `[from, to)` in the **clinic timezone** (`CLINIC_TZ` env, default `UTC`).
2. For each day's weekday, emit `slot_minutes`-wide steps across each active template window.
3. Skip slots in the past, slots already booked (`pending`/`confirmed`), and slots overlapping a block.
4. Return slot times in **UTC**.

Everything in the DB is `TIMESTAMPTZ`. The clinic timezone only matters for generating slot candidates — all storage + API payloads are RFC3339 UTC.

**Race-free booking**: `bookings` has a partial unique index `(admin_id, slot_start) WHERE status IN ('pending','confirmed')`. `service.BookingService.Create` pre-checks `IsSlotAvailable`, then catches `pgconn` error code `23505` if two requests race past the pre-check. Do not remove either layer.

## Booking lifecycle

```
client POST /api/bookings           → pending   (mail to admin)
admin  POST /admin/bookings/:id/confirm → confirmed (mail to client)
either POST /api/bookings/:id/cancel → cancelled
either POST /api/bookings/:id/reschedule → updates slot_start/end (same status)
```

Rescheduling and cancellation have **no time-limit policy yet** (user requirement: anything not started can be moved). When a policy is added, enforce it in `service/booking.go`, not handlers.

Emails are sent in goroutines from the booking service so the HTTP response doesn't block on SMTP. If SMTP env is unset, `MailService.send` logs a warning and no-ops — this is intentional for local dev.

## Common commands

**First-time setup**:
```bash
cp .env.example .env    # then edit secrets
docker compose up --build
```
Stack: frontend at `http://localhost:5173`, API at `http://localhost:8080/api`, Postgres at `localhost:5432`.

**Backend (local, outside docker)** — from `backend/`:
```bash
go mod tidy
go run ./cmd/server
```
Env must be exported or present in `backend/.env` (the app calls `godotenv.Load()` which reads the CWD's `.env`).

**Frontend (local)** — from `frontend/`:
```bash
npm install
npm run dev      # Vite on :5173, proxies /api to :8080
npm run build
```

**Migrations**: run automatically on backend startup. To create a new one, add the pair `migrations/NNNNNN_name.up.sql` + `NNNNNN_name.down.sql` and restart. To roll back manually you need the `migrate` CLI; the embedded runner only does `Up`.

**Tests**: none yet. When adding, prefer integration tests that hit a real Postgres (docker-compose or `pgtestdb`) over mocking pgx.

## Conventions

- **API paths**: everything under `/api`. Public, client-authed, and `/api/admin/*` groups mirror the three Echo route groups in `server/server.go`.
- **Times in payloads**: RFC3339 (`2026-05-01T14:00:00Z`). The frontend renders in the user's browser timezone; the backend computes in `CLINIC_TZ`. Don't confuse the two.
- **Weekdays**: `0 = Sunday … 6 = Saturday` (Postgres and JS `Date.getDay()` convention — we match both deliberately).
- **Errors from service layer**: handlers use `errors.Is` against the sentinel errors in `service/` (`ErrSlotNotAvailable`, `ErrForbidden`, `ErrBadState`) and `repository.ErrNotFound`. Add new sentinels there, not ad-hoc strings.
- **Frontend API access**: all network calls go through `src/api/client.ts` → one of the `*.ts` modules. Don't call `fetch` directly from components. JWT is kept in `localStorage` under `therapy_token`; `api()` adds the `Authorization` header automatically.
- **UI styling**: inline styles and plain markup for now. A designer will replace styles later — don't invest in a design system yet, but do keep components structurally clean (semantic tags, labelled inputs).

## Things to be careful about

- **Adding a new admin endpoint**: mount it inside the `admin` group in `server/server.go` so it gets `JWT` + `AdminOnly` middleware.
- **Adding new env vars**: extend `config.Config` *and* `.env.example` *and* `docker-compose.yml`'s `backend.environment:` block. All three must stay in sync.
- **Timezone**: changing `CLINIC_TZ` after bookings exist is fine (stored timestamps are absolute) but will shift the *template* windows. Document this before doing it.
- **Uniqueness of booked slot**: if you ever need to allow double-booking (group sessions, etc.), you must drop/change `idx_bookings_active_slot` and rework `BookingService.Create`.
