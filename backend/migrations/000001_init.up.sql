CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

CREATE TYPE user_role AS ENUM ('client', 'admin');

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         CITEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name     TEXT NOT NULL,
    phone         TEXT,
    role          user_role NOT NULL DEFAULT 'client',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recurring weekly availability template, owned by an admin user.
CREATE TABLE schedule_templates (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weekday      SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6), -- 0 = Sunday
    start_time   TIME NOT NULL,
    end_time     TIME NOT NULL,
    slot_minutes SMALLINT NOT NULL DEFAULT 60 CHECK (slot_minutes > 0),
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (start_time < end_time)
);

CREATE INDEX idx_schedule_templates_admin ON schedule_templates(admin_id, weekday);

-- Absolute time-range overrides (vacation, sick, personal blocks).
CREATE TABLE schedule_blocks (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    starts_at  TIMESTAMPTZ NOT NULL,
    ends_at    TIMESTAMPTZ NOT NULL,
    reason     TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (starts_at < ends_at)
);

CREATE INDEX idx_schedule_blocks_range ON schedule_blocks(admin_id, starts_at, ends_at);

CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

CREATE TABLE bookings (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    admin_id     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    slot_start   TIMESTAMPTZ NOT NULL,
    slot_end     TIMESTAMPTZ NOT NULL,
    status       booking_status NOT NULL DEFAULT 'pending',
    client_notes TEXT,
    admin_notes  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (slot_start < slot_end)
);

-- Prevent a single admin slot from being held by two active bookings.
CREATE UNIQUE INDEX idx_bookings_active_slot
    ON bookings(admin_id, slot_start)
    WHERE status IN ('pending', 'confirmed');

CREATE INDEX idx_bookings_client ON bookings(client_id, slot_start);
CREATE INDEX idx_bookings_admin_status ON bookings(admin_id, status, slot_start);
