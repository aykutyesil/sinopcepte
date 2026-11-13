-- V60: Şifremi Unuttum & E-Posta Doğrulama Token Tablosu

CREATE TABLE IF NOT EXISTS password_reset_token (
    id          BIGSERIAL    PRIMARY KEY,
    token       VARCHAR(100) NOT NULL UNIQUE,
    user_id     BIGINT       NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    email       VARCHAR(150) NOT NULL,
    expires_at  TIMESTAMPTZ  NOT NULL,
    used        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pwd_reset_token_idx ON password_reset_token (token, used);
CREATE INDEX IF NOT EXISTS pwd_reset_user_idx ON password_reset_token (user_id);
