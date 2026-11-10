-- V30: Gizli İtiraf Paneli (Sinop Gece İtirafları / N9)

CREATE TABLE IF NOT EXISTS confession (
    id            VARCHAR(64)   PRIMARY KEY,
    author_handle VARCHAR(64)   NOT NULL,
    alias_name    VARCHAR(100)  NOT NULL,
    alias_avatar  VARCHAR(32)   NOT NULL DEFAULT 'marti',
    venue_id      VARCHAR(64),
    venue_title   VARCHAR(200),
    category      VARCHAR(32)   NOT NULL DEFAULT 'gece',
    body          TEXT          NOT NULL,
    fire_count    INT           NOT NULL DEFAULT 0,
    laugh_count   INT           NOT NULL DEFAULT 0,
    shock_count   INT           NOT NULL DEFAULT 0,
    heart_count   INT           NOT NULL DEFAULT 0,
    report_count  INT           NOT NULL DEFAULT 0,
    hidden        BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS confession_created_idx ON confession (hidden, created_at DESC);
CREATE INDEX IF NOT EXISTS confession_category_idx ON confession (hidden, category, created_at DESC);
CREATE INDEX IF NOT EXISTS confession_venue_idx ON confession (hidden, venue_id, created_at DESC);

CREATE TABLE IF NOT EXISTS confession_reaction (
    id            BIGSERIAL     PRIMARY KEY,
    confession_id VARCHAR(64)   NOT NULL REFERENCES confession(id) ON DELETE CASCADE,
    user_handle   VARCHAR(64)   NOT NULL,
    reaction_type VARCHAR(16)   NOT NULL,
    UNIQUE(confession_id, user_handle, reaction_type)
);

CREATE INDEX IF NOT EXISTS confession_react_user_idx ON confession_reaction (user_handle);

CREATE TABLE IF NOT EXISTS confession_comment (
    id            VARCHAR(64)   PRIMARY KEY,
    confession_id VARCHAR(64)   NOT NULL REFERENCES confession(id) ON DELETE CASCADE,
    author_handle VARCHAR(64)   NOT NULL,
    alias_name    VARCHAR(100)  NOT NULL,
    alias_avatar  VARCHAR(32)   NOT NULL DEFAULT 'marti',
    is_anonymous  BOOLEAN       NOT NULL DEFAULT TRUE,
    body          VARCHAR(300)  NOT NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS confession_comment_idx ON confession_comment (confession_id, created_at ASC);
