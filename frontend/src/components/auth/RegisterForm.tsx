"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toFormErrors } from "@/lib/api-errors";
import { ApiError, register } from "@/lib/client-api";
import {
  normalizeEmail,
  normalizeHandle,
  safeNext,
  validateEmail,
  validateHandle,
  validatePassword,
} from "@/lib/validation";
import { CARD, FieldError, FormError, INPUT, INPUT_ERROR, Label, PRIMARY_BTN } from "./ui";

type Field = "handle" | "email" | "password" | "kvkkAccepted";
type Errors = Partial<Record<Field, string>>;

export function RegisterForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"), "/profil");

  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useLayoutEffect(
    () => () => {
      setPassword("");
    },
    [],
  );

  const clientErrors = (): Errors => {
    const e: Errors = {};
    const h = validateHandle(handle);
    if (h) e.handle = h;
    const m = validateEmail(email);
    if (m) e.email = m;
    const p = validatePassword(password);
    if (p) e.password = p;
    if (!kvkk) e.kvkkAccepted = "Devam etmek için aydınlatma metnini onaylamalısın.";
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    const e = clientErrors();
    setErrors(e);
    setFormError(null);
    if (Object.keys(e).length > 0) return;

    setBusy(true);
    try {
      await register({ handle: normalizeHandle(handle), email: normalizeEmail(email), password, kvkkAccepted: true });
      router.replace(next);
    } catch (err) {
      const fe =
        err instanceof ApiError ? toFormErrors(err.status, err.body, err.retryAfter) : toFormErrors(0, null);
      const mapped: Errors = {};
      let unknown: string | null = null;
      for (const [k, v] of Object.entries(fe.fields)) {
        if (k === "handle" || k === "email" || k === "password" || k === "kvkkAccepted") mapped[k] = v;
        else unknown = unknown ?? v;
      }
      setErrors(mapped);
      setFormError(fe.form ?? unknown);
      setBusy(false);
    }
  };

  const normalized = normalizeHandle(handle);

  return (
    <div className={CARD}>
      <h1 className="text-xl font-black text-white font-display">Kayıt Ol</h1>
      <p className="text-xs text-slate-400 mt-1 mb-5">Rumuzunla SinopCepte&apos;ye katıl. Hesabı istediğin zaman silebilirsin.</p>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="regHandle">Rumuz</Label>
          <input
            id="regHandle"
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={40}
            aria-invalid={!!errors.handle}
            aria-describedby="regHandleHint regHandleErr"
            className={`${INPUT} ${errors.handle ? INPUT_ERROR : ""}`}
            disabled={busy}
          />
          <p id="regHandleHint" className="mt-1 text-[11px] text-slate-500">
            3–20 karakter: küçük harf, rakam, alt çizgi (_) ve nokta (.).
            {handle && normalized !== handle && !validateHandle(handle) && (
              <span className="text-cyan-400"> Kaydedilecek: @{normalized}</span>
            )}
          </p>
          <FieldError id="regHandleErr" message={errors.handle} />
        </div>
        <div>
          <Label htmlFor="regEmail">E-posta</Label>
          <input
            id="regEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={!!errors.email}
            aria-describedby="regEmailErr"
            className={`${INPUT} ${errors.email ? INPUT_ERROR : ""}`}
            disabled={busy}
          />
          <FieldError id="regEmailErr" message={errors.email} />
        </div>
        <div>
          <Label htmlFor="regPassword">Şifre</Label>
          <input
            id="regPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby="regPasswordHint regPasswordErr"
            className={`${INPUT} ${errors.password ? INPUT_ERROR : ""}`}
            disabled={busy}
          />
          <p id="regPasswordHint" className="mt-1 text-[11px] text-slate-500">
            En az 8 karakter.
          </p>
          <FieldError id="regPasswordErr" message={errors.password} />
        </div>
        <div>
          <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={kvkk}
              onChange={(e) => setKvkk(e.target.checked)}
              aria-invalid={!!errors.kvkkAccepted}
              aria-describedby="regKvkkErr"
              className="mt-0.5 w-4 h-4 accent-rose-600 shrink-0"
              disabled={busy}
            />
            <span>
              <Link href="/kvkk" target="_blank" className="font-bold text-rose-400 hover:text-rose-300 underline">
                KVKK Aydınlatma Metni
              </Link>
              &apos;ni okudum.
            </span>
          </label>
          <FieldError id="regKvkkErr" message={errors.kvkkAccepted} />
        </div>
        <FormError message={formError} />
        <button type="submit" className={PRIMARY_BTN} disabled={busy}>
          {busy ? "Hesap oluşturuluyor…" : "Kayıt Ol"}
        </button>
      </form>
      <p className="text-xs text-slate-400 mt-5 text-center">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="font-bold text-rose-400 hover:text-rose-300">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
