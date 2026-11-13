-- V50: Uzak Mesafe Ortak Taksi & Canlı Masraf Paylaşım Lobisi

CREATE TABLE IF NOT EXISTS taxi_lobby (
    id               VARCHAR(64)   PRIMARY KEY,
    host_handle      VARCHAR(64)   NOT NULL,
    host_name        VARCHAR(100)  NOT NULL,
    host_avatar      VARCHAR(32)   NOT NULL DEFAULT 'student',
    host_phone       VARCHAR(32),
    destination      VARCHAR(150)  NOT NULL,
    departure_point  VARCHAR(150)  NOT NULL,
    departure_time   VARCHAR(64)   NOT NULL,
    total_seats      INT           NOT NULL DEFAULT 4,
    occupied_seats   INT           NOT NULL DEFAULT 1,
    estimated_fare   VARCHAR(64),
    note             TEXT,
    status           VARCHAR(32)   NOT NULL DEFAULT 'OPEN',
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS taxi_lobby_dest_idx ON taxi_lobby (destination, created_at DESC);
CREATE INDEX IF NOT EXISTS taxi_lobby_status_idx ON taxi_lobby (status, created_at DESC);
CREATE INDEX IF NOT EXISTS taxi_lobby_created_idx ON taxi_lobby (created_at DESC);

CREATE TABLE IF NOT EXISTS taxi_lobby_member (
    id          BIGSERIAL     PRIMARY KEY,
    lobby_id    VARCHAR(64)   NOT NULL REFERENCES taxi_lobby(id) ON DELETE CASCADE,
    user_handle VARCHAR(64)   NOT NULL,
    user_name   VARCHAR(100)  NOT NULL,
    user_avatar VARCHAR(32)   NOT NULL DEFAULT 'student',
    user_phone  VARCHAR(32),
    joined_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE(lobby_id, user_handle)
);

CREATE INDEX IF NOT EXISTS taxi_lobby_member_lobby_idx ON taxi_lobby_member (lobby_id);
CREATE INDEX IF NOT EXISTS taxi_lobby_member_user_idx ON taxi_lobby_member (user_handle);
