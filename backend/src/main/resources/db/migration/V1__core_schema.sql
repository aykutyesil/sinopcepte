-- Çekirdek şema (Faz 1). Sürüm aralığı: V1–V9 çekirdek modüle ayrılmıştır.
-- V10+ sonraki modüllere aittir (auth genişletmesi, check-in, itiraf, ilan).

-- Kartlar: mekan / tekel / taksi / eczane / çiçek
create table item (
    id          varchar(64)   primary key,
    category    varchar(16)   not null,
    title       varchar(200)  not null,
    badge       varchar(200),
    location    varchar(300),
    description text,          -- JSON alanı: "desc" (SQL'de ayrılmış kelime)
    phone       varchar(32),
    wa          varchar(32),
    rating      varchar(8),
    map_url     varchar(1000),
    sort_order  integer       not null,
    constraint item_category_chk check (category in ('mekan', 'tekel', 'taksi', 'eczane', 'cicek'))
);
create index item_sort_idx on item (sort_order);

-- Canlı etkinlik / maç akışı
create table live_event (
    id          varchar(64)   primary key,
    title       varchar(200)  not null,
    venue       varchar(200),
    location    varchar(300),
    date_label  varchar(100), -- JSON alanı: "date" (serbest metin, ör. "Bugün Canlı • 20:00")
    badge       varchar(200),
    description text,          -- JSON alanı: "desc"
    wa          varchar(32),
    sort_order  integer       not null
);
create index live_event_sort_idx on live_event (sort_order);

-- Nöbetçi eczane kayıtları (gün başına bir kayıt; son kayıt gösterilir)
create table pharmacy_duty (
    id              bigserial     primary key,
    duty_date       date          not null unique,
    name            varchar(200)  not null,
    address         varchar(500),
    phone           varchar(40),
    phone_formatted varchar(20),
    map_url         varchar(1000),
    lat             double precision,
    lng             double precision,
    updated_at      timestamptz   not null
);

-- Kullanıcılar (Faz 2'de genişletilecek)
create table app_user (
    id            bigserial     primary key,
    username      varchar(64)   not null unique,
    password_hash varchar(100)  not null,
    role          varchar(16)   not null,
    created_at    timestamptz   not null default now(),
    constraint app_user_role_chk check (role in ('ADMIN', 'USER'))
);
