-- N7: kullanıcı profili (sürüm aralığı V10–V19 auth modülüne aittir).
-- Mevcut satırlar (Faz 1 admin'i) korunur; yeni kolonların hepsi ya nullable ya varsayılanlı.

-- Rumuzlar küçük harfle saklanır. Faz 1'de ADMIN_USERNAME büyük harf içerebiliyordu;
-- giriş artık küçük harfe çevirerek aradığı için mevcut adlar da küçültülür.
-- (Yalnız büyük/küçük harfle ayrışan iki kullanıcı olsaydı bu satır benzersizlik hatası verirdi;
--  Faz 1'de tek kullanıcı admin'dir.)
update app_user set username = lower(username) where username <> lower(username);

alter table app_user
    add column email              varchar(254),                       -- admin'de yok → nullable
    add column avatar             varchar(16)  not null default 'marti',
    add column bio                varchar(160),                       -- en fazla 160 karakter
    add column instagram          varchar(30),                        -- yalnız kullanıcı adı, URL değil
    add column checkin_visibility varchar(8)   not null default 'PUBLIC',
    add column anonymous_mode     boolean      not null default false,
    add column kvkk_accepted_at   timestamptz,                        -- admin'de yok → nullable
    add column kvkk_version       varchar(32);

alter table app_user
    add constraint app_user_checkin_visibility_chk check (checkin_visibility in ('PUBLIC', 'HIDDEN')),
    -- Küçük harfle saklama kuralını veritabanı da zorlar.
    add constraint app_user_username_lowercase_chk check (username = lower(username)),
    add constraint app_user_email_lowercase_chk check (email is null or email = lower(email));

-- Büyük/küçük harf duyarsız tekillik (uygulama zaten küçültür; bu ikinci savunma hattı).
-- Kısıt adları uygulamada 409'un hangi alana ait olduğunu bulmak için kullanılır.
create unique index app_user_username_lower_uq on app_user (lower(username));
create unique index app_user_email_lower_uq on app_user (lower(email)) where email is not null;
