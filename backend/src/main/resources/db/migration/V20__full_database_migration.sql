-- V20: Mekan profili, Patron sahipliği, Swarm Check-In, Okeye 4 ve Bildirimler tam veritabanı şeması.

-- 1. app_user geliştirmeleri
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS phone VARCHAR(32);
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS badges_json TEXT NOT NULL DEFAULT '["📍 Sinoplu"]';

-- 2. item tablosu geliştirmeleri (Mekan profili için)
ALTER TABLE item ADD COLUMN IF NOT EXISTS owner_handle VARCHAR(64);
ALTER TABLE item ADD COLUMN IF NOT EXISTS photos_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE item ADD COLUMN IF NOT EXISTS menu_json TEXT NOT NULL DEFAULT '[]';

-- 3. Mekan sahipliği / patron yetki talepleri tablosu
CREATE TABLE IF NOT EXISTS venue_claim_request (
    id           VARCHAR(64)   PRIMARY KEY,
    item_id      VARCHAR(64)   NOT NULL,
    venue_title  VARCHAR(200)  NOT NULL,
    user_handle  VARCHAR(64)   NOT NULL,
    phone        VARCHAR(32),
    note         TEXT,
    status       VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS venue_claim_item_idx ON venue_claim_request (item_id);
CREATE INDEX IF NOT EXISTS venue_claim_user_idx ON venue_claim_request (user_handle);
CREATE INDEX IF NOT EXISTS venue_claim_status_idx ON venue_claim_request (status);

-- 4. Swarm Check-in tablosu
CREATE TABLE IF NOT EXISTS venue_checkin (
    id            VARCHAR(64)   PRIMARY KEY,
    item_id       VARCHAR(64)   NOT NULL,
    handle        VARCHAR(64)   NOT NULL,
    display_name  VARCHAR(100)  NOT NULL,
    avatar        VARCHAR(32)   NOT NULL,
    note          VARCHAR(200),
    mood          VARCHAR(64),
    checked_in_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS venue_checkin_item_idx ON venue_checkin (item_id, checked_in_at DESC);
CREATE INDEX IF NOT EXISTS venue_checkin_handle_idx ON venue_checkin (handle);

-- 5. Okeye 4. Aranıyor ve Sosyal Masalar tablosu
CREATE TABLE IF NOT EXISTS okeye4_lobby (
    id                VARCHAR(64)   PRIMARY KEY,
    category          VARCHAR(32)   NOT NULL,
    title             VARCHAR(200)  NOT NULL,
    venue             VARCHAR(200)  NOT NULL,
    district          VARCHAR(100)  NOT NULL,
    current_players   INT           NOT NULL,
    max_players       INT           NOT NULL,
    start_time        VARCHAR(64)   NOT NULL,
    expires_in        VARCHAR(64)   NOT NULL,
    host_handle       VARCHAR(64)   NOT NULL,
    host_name         VARCHAR(100)  NOT NULL,
    host_avatar       VARCHAR(32)   NOT NULL,
    host_trust_score  INT           NOT NULL DEFAULT 95,
    host_badge        VARCHAR(100)  NOT NULL DEFAULT 'Sinoplu Üye',
    host_phone        VARCHAR(32),
    host_wa           VARCHAR(32),
    note              TEXT,
    status            VARCHAR(20)   NOT NULL DEFAULT 'OPEN',
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS okeye4_lobby_status_idx ON okeye4_lobby (status, created_at DESC);

-- 6. Okeye 4. Katılım Başvuruları tablosu
CREATE TABLE IF NOT EXISTS okeye4_join_request (
    id                     VARCHAR(64)   PRIMARY KEY,
    lobby_id               VARCHAR(64)   NOT NULL REFERENCES okeye4_lobby(id) ON DELETE CASCADE,
    applicant_handle       VARCHAR(64)   NOT NULL,
    applicant_name         VARCHAR(100)  NOT NULL,
    applicant_avatar       VARCHAR(32)   NOT NULL,
    applicant_trust_score  INT           NOT NULL DEFAULT 95,
    applicant_phone        VARCHAR(32),
    note                   VARCHAR(300),
    status                 VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    created_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS okeye4_join_req_lobby_idx ON okeye4_join_request (lobby_id);

-- 7. Uygulama İçi Canlı Bildirimler tablosu
CREATE TABLE IF NOT EXISTS app_notification (
    id                VARCHAR(64)   PRIMARY KEY,
    recipient_handle  VARCHAR(64),
    type              VARCHAR(32)   NOT NULL,
    title             VARCHAR(200)  NOT NULL,
    body              TEXT          NOT NULL,
    time_label        VARCHAR(64)   NOT NULL,
    read              BOOLEAN       NOT NULL DEFAULT FALSE,
    href              VARCHAR(200),
    action_label      VARCHAR(100),
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS app_notif_recipient_idx ON app_notification (recipient_handle, created_at DESC);
