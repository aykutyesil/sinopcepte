"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    message: string;
    maskedEmail: string;
    devResetToken?: string;
    resetUrl?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Lütfen rumuzunuzu veya e-posta adresinizi girin.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrHandle: identifier.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Şifre sıfırlama isteği gönderilemedi");
      }

      setResult({
        message: data.message || "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
        maskedEmail: data.maskedEmail,
        devResetToken: data.devResetToken,
        resetUrl: data.resetUrl,
      });
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/giris"
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            ←
          </Link>
          <div>
            <h1 className="text-xl font-black font-display tracking-tight text-slate-900 dark:text-white">
              Şifremi Unuttum
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hesabınıza ait e-posta veya rumuzunuzu girin
            </p>
          </div>
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
              <div className="flex items-center gap-2 font-bold mb-1">
                <span>✉️</span>
                <span>Sıfırlama Bağlantısı Gönderildi</span>
              </div>
              <p className="text-xs leading-relaxed text-emerald-700 dark:text-emerald-300">
                {result.maskedEmail ? (
                  <>
                    <strong className="font-semibold">{result.maskedEmail}</strong> adresine şifrenizi yenilemeniz için güvenli bir bağlantı ilettik. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.
                  </>
                ) : (
                  result.message
                )}
              </p>
            </div>

            {result.devResetToken && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
                <span className="font-semibold block mb-1">🛠️ Geliştirici / Test Kısayolu:</span>
                <Link
                  href={`/sifre-sifirla?token=${result.devResetToken}`}
                  className="inline-block mt-1 font-bold text-rose-600 dark:text-rose-400 underline hover:no-underline"
                >
                  Şifreyi Şimdi Sıfırla (Doğrudan Ekranına Git) →
                </Link>
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/giris"
                className="w-full block text-center py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow hover:opacity-90 transition"
              >
                Giriş Ekranına Dön
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Kayıtlı Rumuz veya E-posta
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Örn: aykut veya ornek@sinopcepte.com"
                disabled={busy}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/20 active:scale-[0.99] transition disabled:opacity-50"
            >
              {busy ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/giris"
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
              >
                ← Giriş Ekranına Geri Dön
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
