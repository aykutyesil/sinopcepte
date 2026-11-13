-- V40: SNÜ Kampüs & Vize-Final Ders Notları Paylaşımı

CREATE TABLE IF NOT EXISTS campus_note (
    id             VARCHAR(64)   PRIMARY KEY,
    author_handle  VARCHAR(64)   NOT NULL,
    author_name    VARCHAR(100)  NOT NULL,
    author_avatar  VARCHAR(32)   NOT NULL DEFAULT 'student',
    faculty        VARCHAR(150)  NOT NULL,
    department     VARCHAR(150)  NOT NULL,
    course_code    VARCHAR(32)   NOT NULL,
    course_name    VARCHAR(150)  NOT NULL,
    term           VARCHAR(32)   NOT NULL DEFAULT 'Güz',
    exam_type      VARCHAR(32)   NOT NULL DEFAULT 'Vize',
    title          VARCHAR(250)  NOT NULL,
    description    TEXT,
    file_url       VARCHAR(500)  NOT NULL,
    file_name      VARCHAR(250)  NOT NULL,
    file_size      VARCHAR(32)   NOT NULL DEFAULT '1.5 MB',
    like_count     INT           NOT NULL DEFAULT 0,
    download_count INT           NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS campus_note_faculty_idx ON campus_note (faculty, department, created_at DESC);
CREATE INDEX IF NOT EXISTS campus_note_type_idx ON campus_note (exam_type, created_at DESC);
CREATE INDEX IF NOT EXISTS campus_note_created_idx ON campus_note (created_at DESC);

CREATE TABLE IF NOT EXISTS campus_note_like (
    id          BIGSERIAL     PRIMARY KEY,
    note_id     VARCHAR(64)   NOT NULL REFERENCES campus_note(id) ON DELETE CASCADE,
    user_handle VARCHAR(64)   NOT NULL,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE(note_id, user_handle)
);

CREATE INDEX IF NOT EXISTS campus_note_like_user_idx ON campus_note_like (user_handle);
