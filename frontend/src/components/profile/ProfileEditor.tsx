"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toFormErrors } from "@/lib/api-errors";
import { avatarEmoji, DEFAULT_AVATAR, isAvatarKey } from "@/lib/avatars";
import {
  ApiError,
  changePassword,
  deleteAccount,
  fetchMe,
  fetchOwnProfile,
  isAdmin,
  logout,
  updateOwnProfile,
} from "@/lib/client-api";
import { formatJoinDate } from "@/lib/format";
import type { CheckinVisibility, OwnProfile } from "@/lib/types";
import {
  BIO_MAX,
  bioLength,
  normalizeInstagram,
  validateBio,
  validateInstagram,
  validatePassword,
} from "@/lib/validation";
import { CARD, FieldError, FormError, FormSuccess, INPUT, INPUT_ERROR, Label, PRIMARY_BTN, SECONDARY_BTN } from "../auth/ui";
import { AvatarPicker } from "./AvatarPicker";

const LOGIN_REDIRECT = "/giris?next=%2Fprofil";

type Load = { state: "loading" } | { state: "error" } | { state: "ok"; profile: OwnProfile };

export function ProfileEditor() {
  const router = useRouter();
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  // Sayfa (Activity ile) her görünür olduğunda yeniden çalışır: oturum düştüyse girişe yönlendirir.
  useEffect(() => {
    let alive = true;
    fetchOwnProfile().then(
      (profile) => {
        if (alive) setLoad({ state: "ok", profile });
      },
      (e) => {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 401) router.replace(LOGIN_REDIRECT);
        else setLoad({ state: "error" });
      },
    );
    return () => {
      alive = false;
    };
  }, [router, reloadKey]);

  const onSessionLost = () => router.replace(LOGIN_REDIRECT);

  if (load.state === "loading") {
    return (
      <div className="space-y-4" aria-label="Profil yükleniyor">
        <div className={`${CARD} h-40 animate-pulse`} />
        <div className={`${CARD} h-96 animate-pulse`} />
      </div>
    );
  }

  if (load.state === "error") {
    return (
      <div className={`${CARD} text-center space-y-3`}>
        <p className="text-sm text-slate-300">Profil bilgileri alınamadı. Sunucuya ulaşılamıyor olabilir.</p>
        <button type="button" className={SECONDARY_BTN} onClick={() => setReloadKey((k) => k + 1)}>
          Tekrar dene
        </button>
      </div>
    );
  }

  const profile = load.profile;
  const admin = isAdmin({ username: profile.handle, roles: profile.roles });

  return (
    <div className="space-y-4">
      <ProfileHeader profile={profile} admin={admin} />
      <ProfileForm
        // Form ilk yüklemede profilden başlar; kaydetmeden sonra sunucunun döndürdüğü değerlerle güncellenir.
        key={profile.handle}
        profile={profile}
        onSaved={(p) => setLoad({ state: "ok", profile: p })}
        onSessionLost={onSessionLost}
      />
      <PasswordSection onSessionLost={onSessionLost} />
      <DeleteSection admin={admin} onDeleted={() => { window.location.href = "/"; }} onSessionLost={onSessionLost} />
    </div>
  );
}

function ProfileHeader({ profile, admin }: { profile: OwnProfile; admin: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const joined = formatJoinDate(profile.createdAt);

  const doLogout = async () => {
    setBusy(true);
    try {
      await logout();
    } catch {
      // Oturum zaten düşmüş olabilir; yine de çıkış durumuna geç.
    }
    window.location.href = "/";
  };

  return (
    <section className={CARD}>
      <div className="flex items-start gap-4">
        <div className="story-ring shrink-0">
          <div className="w-16 h-16 rounded-full bg-[#0f1428] flex items-center justify-center text-3xl" aria-hidden="true">
            {avatarEmoji(profile.avatar)}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-black text-white font-display truncate">@{profile.handle}</h1>
          {joined && <p className="text-xs text-slate-400 mt-0.5">{joined} tarihinde katıldı</p>}
          {admin && (
            <span className="inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30">
              YÖNETİCİ
            </span>
          )}
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="ownEmail">E-posta (değiştirilemez)</Label>
        <input id="ownEmail" type="email" value={profile.email ?? ""} readOnly className={`${INPUT} text-slate-400`} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {!admin && (
          <Link href={`/u/${encodeURIComponent(profile.handle)}`} className={SECONDARY_BTN}>
            Herkese açık profilim
          </Link>
        )}
        <button type="button" onClick={doLogout} disabled={busy} className={`${SECONDARY_BTN} hover:text-rose-400`}>
          Çıkış Yap
        </button>
      </div>
    </section>
  );
}

type ProfileField = "avatar" | "bio" | "instagram" | "checkinVisibility" | "anonymousMode";

function ProfileForm({
  profile,
  onSaved,
  onSessionLost,
}: {
  profile: OwnProfile;
  onSaved: (p: OwnProfile) => void;
  onSessionLost: () => void;
}) {
  const [avatar, setAvatar] = useState<string>(isAvatarKey(profile.avatar) ? profile.avatar : DEFAULT_AVATAR);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [instagram, setInstagram] = useState(profile.instagram ?? "");
  const [visibility, setVisibility] = useState<CheckinVisibility>(profile.checkinVisibility === "HIDDEN" ? "HIDDEN" : "PUBLIC");
  const [anonymous, setAnonymous] = useState(!!profile.anonymousMode);
  const [errors, setErrors] = useState<Partial<Record<ProfileField, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const count = bioLength(bio);

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    const e: Partial<Record<ProfileField, string>> = {};
    const b = validateBio(bio);
    if (b) e.bio = b;
    const i = validateInstagram(instagram);
    if (i) e.instagram = i;
    setErrors(e);
    setFormError(null);
    setSuccess(null);
    if (Object.keys(e).length > 0) return;

    setBusy(true);
    try {
      const saved = await updateOwnProfile({
        avatar,
        bio,
        instagram: normalizeInstagram(instagram),
        checkinVisibility: visibility,
        anonymousMode: anonymous,
      });
      setBusy(false);
      setAvatar(isAvatarKey(saved.avatar) ? saved.avatar : DEFAULT_AVATAR);
      setBio(saved.bio ?? "");
      setInstagram(saved.instagram ?? "");
      setVisibility(saved.checkinVisibility === "HIDDEN" ? "HIDDEN" : "PUBLIC");
      setAnonymous(!!saved.anonymousMode);
      setSuccess("Profil kaydedildi.");
      onSaved(saved);
    } catch (err) {
      setBusy(false);
      if (err instanceof ApiError && err.status === 401) return onSessionLost();
      const fe = err instanceof ApiError ? toFormErrors(err.status, err.body, err.retryAfter) : toFormErrors(0, null);
      const mapped: Partial<Record<ProfileField, string>> = {};
      let other: string | null = null;
      for (const [k, v] of Object.entries(fe.fields)) {
        if (k === "avatar" || k === "bio" || k === "instagram" || k === "checkinVisibility" || k === "anonymousMode") mapped[k] = v;
        else other = other ?? v;
      }
      setErrors(mapped);
      setFormError(
        err instanceof ApiError && err.status === 403
          ? "Oturum doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin."
          : (fe.form ?? other),
      );
    }
  };

  return (
    <section className={CARD}>
      <h2 className="text-base font-black text-white mb-4">Profili Düzenle</h2>
      <form onSubmit={save} className="space-y-5" noValidate>
        <div>
          <p className="block text-xs font-bold text-slate-400 mb-2">Avatar</p>
          <AvatarPicker value={avatar} onChange={setAvatar} disabled={busy} />
          <FieldError id="avatarErr" message={errors.avatar} />
        </div>

        <div>
          <Label htmlFor="bio">Biyografi</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            aria-invalid={!!errors.bio}
            aria-describedby="bioCount bioErr"
            placeholder="Kendinden kısaca bahset…"
            className={`${INPUT} resize-y ${errors.bio ? INPUT_ERROR : ""}`}
            disabled={busy}
          />
          <p id="bioCount" className={`mt-1 text-[11px] text-right font-mono ${count > BIO_MAX ? "text-rose-400" : "text-slate-500"}`}>
            {count}/{BIO_MAX}
          </p>
          <FieldError id="bioErr" message={errors.bio} />
        </div>

        <div>
          <Label htmlFor="instagram">Instagram kullanıcı adı</Label>
          <div className={`flex items-center bg-[#070914] border rounded-xl focus-within:border-rose-500 ${errors.instagram ? INPUT_ERROR : "border-slate-800"}`}>
            <span className="pl-4 pr-1 text-sm text-slate-500 select-none" aria-hidden="true">
              @
            </span>
            <input
              id="instagram"
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              autoCapitalize="none"
              spellCheck={false}
              placeholder="kullaniciadi"
              aria-invalid={!!errors.instagram}
              aria-describedby="instagramHint instagramErr"
              className="flex-1 min-w-0 bg-transparent pr-4 py-2.5 text-sm text-white focus:outline-hidden disabled:opacity-60"
              disabled={busy}
            />
          </div>
          <p id="instagramHint" className="mt-1 text-[11px] text-slate-500">
            Bağlantı değil, yalnız kullanıcı adı. Boş bırakırsan profilinde görünmez.
          </p>
          <FieldError id="instagramErr" message={errors.instagram} />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-xs font-bold text-slate-400 mb-2">Gizlilik</legend>
          <div role="radiogroup" aria-label="Check-in görünürlüğü" className="grid grid-cols-1 xs:grid-cols-2 gap-2">
            {(
              [
                { v: "PUBLIC", t: "🌍 Herkese açık", d: "Check-in'lerin profilinde ve listelerde görünür." },
                { v: "HIDDEN", t: "🙈 Gizli", d: "Check-in'lerin başkalarına gösterilmez." },
              ] as const
            ).map((o) => (
              <label
                key={o.v}
                className={`block rounded-2xl border p-3 cursor-pointer transition ${
                  visibility === o.v ? "border-rose-500 bg-rose-600/10" : "border-slate-800 bg-[#070914] hover:border-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="checkinVisibility"
                  value={o.v}
                  checked={visibility === o.v}
                  onChange={() => setVisibility(o.v)}
                  className="sr-only"
                  disabled={busy}
                />
                <span className="block text-xs font-bold text-white">Check-in: {o.t}</span>
                <span className="block text-[11px] text-slate-400 mt-0.5">{o.d}</span>
              </label>
            ))}
          </div>
          <FieldError id="visErr" message={errors.checkinVisibility} />
          <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-rose-600 shrink-0"
              disabled={busy}
            />
            <span>
              <span className="font-bold text-white">Anonim mod</span>
              <span className="block text-[11px] text-slate-400">Paylaşımlarında rumuzun yerine anonim görün.</span>
            </span>
          </label>
          <FieldError id="anonErr" message={errors.anonymousMode} />
        </fieldset>

        <FormError message={formError} />
        <FormSuccess message={success} />
        <button type="submit" className={PRIMARY_BTN} disabled={busy}>
          {busy ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </form>
    </section>
  );
}

function PasswordSection({ onSessionLost }: { onSessionLost: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string; repeat?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useLayoutEffect(
    () => () => {
      setCurrent("");
      setNext("");
      setRepeat("");
    },
    [],
  );

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    const e: typeof errors = {};
    if (!current) e.currentPassword = "Mevcut şifreni gir.";
    const p = validatePassword(next);
    if (p) e.newPassword = p;
    if (!e.newPassword && next !== repeat) e.repeat = "Yeni şifreler eşleşmiyor.";
    setErrors(e);
    setFormError(null);
    setSuccess(null);
    if (Object.keys(e).length > 0) return;

    setBusy(true);
    try {
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      setRepeat("");
      setSuccess("Şifren değiştirildi.");
    } catch (err) {
      if (err instanceof ApiError) {
        const fe = toFormErrors(err.status, err.body, err.retryAfter);
        // Sözleşme: yanlış mevcut şifre = 401 + errors[0].field = currentPassword (oturum düşmesi DEĞİL).
        if (err.status === 401 && !fe.fields.currentPassword) {
          setBusy(false);
          return onSessionLost();
        }
        setErrors({
          currentPassword: fe.fields.currentPassword ?? (err.status === 401 ? "Mevcut şifre hatalı." : undefined),
          newPassword: fe.fields.newPassword,
        });
        setFormError(
          err.status === 403
            ? "Oturum doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin."
            : fe.fields.currentPassword || fe.fields.newPassword
              ? null
              : fe.form,
        );
      } else {
        setFormError(toFormErrors(0, null).form);
      }
    }
    setBusy(false);
  };

  return (
    <section className={CARD}>
      <h2 className="text-base font-black text-white mb-4">Şifre Değiştir</h2>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {/* Parola yöneticileri için gizli kullanıcı adı alanı gerekmez; autocomplete ipuçları yeterli. */}
        <div>
          <Label htmlFor="pwCurrent">Mevcut şifre</Label>
          <input
            id="pwCurrent"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            aria-invalid={!!errors.currentPassword}
            aria-describedby="pwCurrentErr"
            className={`${INPUT} ${errors.currentPassword ? INPUT_ERROR : ""}`}
            disabled={busy}
          />
          <FieldError id="pwCurrentErr" message={errors.currentPassword} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="min-w-0">
            <Label htmlFor="pwNew">Yeni şifre</Label>
            <input
              id="pwNew"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
              aria-invalid={!!errors.newPassword}
              aria-describedby="pwNewErr"
              className={`${INPUT} ${errors.newPassword ? INPUT_ERROR : ""}`}
              disabled={busy}
            />
            <FieldError id="pwNewErr" message={errors.newPassword} />
          </div>
          <div className="min-w-0">
            <Label htmlFor="pwRepeat">Yeni şifre (tekrar)</Label>
            <input
              id="pwRepeat"
              type="password"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              autoComplete="new-password"
              aria-invalid={!!errors.repeat}
              aria-describedby="pwRepeatErr"
              className={`${INPUT} ${errors.repeat ? INPUT_ERROR : ""}`}
              disabled={busy}
            />
            <FieldError id="pwRepeatErr" message={errors.repeat} />
          </div>
        </div>
        <FormError message={formError} />
        <FormSuccess message={success} />
        <button type="submit" className={PRIMARY_BTN} disabled={busy}>
          {busy ? "Değiştiriliyor…" : "Şifreyi Değiştir"}
        </button>
      </form>
    </section>
  );
}

function DeleteSection({
  admin,
  onDeleted,
  onSessionLost,
}: {
  admin: boolean;
  onDeleted: () => void;
  onSessionLost: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useLayoutEffect(
    () => () => {
      setPassword("");
      setConfirmed(false);
    },
    [],
  );

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy || admin) return;
    setError(null);
    setFieldError(null);
    if (!password) {
      setFieldError("Hesabı silmek için şifreni gir.");
      return;
    }
    if (!confirmed) {
      setError("Silme işleminin geri alınamayacağını onaylamalısın.");
      return;
    }
    setBusy(true);
    try {
      await deleteAccount(password);
      setPassword("");
      onDeleted();
      return;
    } catch (err) {
      if (err instanceof ApiError) {
        const fe = toFormErrors(err.status, err.body, err.retryAfter);
        if (err.status === 403 && !fe.fields.password) setError("Yönetici hesabı silinemez.");
        else if (fe.fields.password) setFieldError(fe.fields.password);
        else if (err.status === 401) {
          // Alan bilgisi yoksa oturumu yokla: oturum duruyorsa 401 = yanlış şifre.
          const stillIn = await fetchMe();
          setBusy(false);
          if (!stillIn) return onSessionLost();
          setFieldError("Şifre hatalı.");
          return;
        } else setError(fe.form);
      } else {
        setError(toFormErrors(0, null).form);
      }
    }
    setBusy(false);
  };

  return (
    <section className="bg-[#0f1428] border border-rose-900/60 rounded-3xl p-5 sm:p-6">
      <h2 className="text-base font-black text-rose-400 mb-2">Hesabı Sil</h2>
      {admin ? (
        <p className="text-xs text-slate-400">Yönetici hesabı silinemez.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="text-xs text-rose-200 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2.5 space-y-1">
            <p className="font-bold">⚠️ Bu işlem geri alınamaz.</p>
            <p>Hesabın ve profil bilgilerin kalıcı olarak silinir, oturumun kapanır. Aynı rumuzu geri almak mümkün olmayabilir.</p>
          </div>
          <div>
            <Label htmlFor="delPassword">Şifren</Label>
            <input
              id="delPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              aria-invalid={!!fieldError}
              aria-describedby="delPasswordErr"
              className={`${INPUT} ${fieldError ? INPUT_ERROR : ""}`}
              disabled={busy}
            />
            <FieldError id="delPasswordErr" message={fieldError} />
          </div>
          <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-rose-600 shrink-0"
              disabled={busy}
            />
            <span>Hesabımın kalıcı olarak silineceğini anladım.</span>
          </label>
          <FormError message={error} />
          <button
            type="submit"
            disabled={busy || !confirmed}
            className="w-full py-2.5 rounded-xl border border-rose-600 text-rose-300 hover:bg-rose-600 hover:text-white font-bold text-sm transition disabled:opacity-50"
          >
            {busy ? "Siliniyor…" : "Hesabımı Kalıcı Olarak Sil"}
          </button>
        </form>
      )}
    </section>
  );
}
