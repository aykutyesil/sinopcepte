"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toFormErrors } from "@/lib/api-errors";
import { ApiError, login } from "@/lib/client-api";
import { safeNext } from "@/lib/validation";
import { CARD, FormError, INPUT, Label, PRIMARY_BTN } from "./ui";

export function LoginForm() {
  const params = useSearchParams();
  const rawNext = params.get("next");
  const parsedNext = safeNext(rawNext, "/");
  // Üye girişi yapıldığında profil yerine doğrudan ana sayfaya yönlendir
  const next = parsedNext === "/profil" ? "/" : parsedNext;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Next.js sayfayı <Activity> ile gizleyip state'i korur: şifre gizli DOM'da kalmasın.
  useLayoutEffect(
    () => () => {
      setPassword("");
      setError(null);
    },
    [],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const u = username.trim();
    if (!u || !password) {
      setError("Rumuz veya e-posta ile şifrenizi girin.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await login(u, password);
      // Farklı kullanıcı geçişinde React state'i ve çerezleri tam yenilemek için tam sayfa yönlendirmesi
      window.location.href = next;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 400) setError("Rumuz/e-posta veya şifre hatalı.");
        else if (err.status === 403) setError("Oturum doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin.");
        else setError(toFormErrors(err.status, err.body, err.retryAfter).form);
      } else {
        setError(toFormErrors(0, null).form);
      }
      setBusy(false);
    }
  };

  const registerHref = rawNext && next === rawNext ? `/kayit?next=${encodeURIComponent(next)}` : "/kayit";

  return (
    <div className={CARD}>
      <h1 className="text-xl font-black text-white font-display">Giriş Yap</h1>
      <p className="text-xs text-slate-400 mt-1 mb-5">Rumuzun veya e-posta adresinle giriş yap.</p>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="loginUser">Rumuz veya e-posta</Label>
          <input
            id="loginUser"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            className={INPUT}
            disabled={busy}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="loginPassword">Şifre</Label>
            <Link href="/sifremi-unuttum" className="text-xs text-rose-400 hover:text-rose-300 transition">
              Şifremi Unuttum?
            </Link>
          </div>
          <div className="relative">
            <input
              id="loginPassword"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className={`${INPUT} pr-10`}
              disabled={busy}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1 text-sm select-none"
              title={showPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
              aria-label={showPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
            >
              {showPassword ? "👁️" : "🙈"}
            </button>
          </div>
        </div>
        <FormError message={error} />
        <button type="submit" className={PRIMARY_BTN} disabled={busy}>
          {busy ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
      </form>
      <p className="text-xs text-slate-400 mt-5 text-center">
        Hesabın yok mu?{" "}
        <Link href={registerHref} className="font-bold text-rose-400 hover:text-rose-300">
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}
