"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [targetUser, setTargetUser] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setTokenValid(false);
      setTokenError("Geçersiz veya eksik şifre sıfırlama bağlantısı.");
      return;
    }

    async function checkToken() {
      try {
        const res = await fetch(`/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok && data.valid) {
          setTokenValid(true);
          setTargetUser(data.username || null);
        } else {
          setTokenValid(false);
          setTokenError(data.message || "Bu bağlantının süresi dolmuş veya daha önce kullanılmış.");
        }
      } catch (err: any) {
        setTokenValid(false);
        setTokenError("Bağlantı doğrulanamadı. Lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    }

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (newPassword.length < 6) {
      setSubmitError("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSubmitError("Şifreler birbiriyle eşleşmiyor.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Şifre güncellenemedi");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/giris");
      }, 3000);
    } catch (err: any) {
      setSubmitError(err.message || "Şifre güncellenirken bir sorun oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
            Yeni Şifre Belirle
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {targetUser ? `@${targetUser} hesabı için yeni şifre oluşturun` : "Hesabınız için yeni bir şifre girin"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent mb-3" />
          <p>Bağlantı doğrulanıyor…</p>
        </div>
      ) : !tokenValid ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs leading-relaxed">
            <span className="font-bold block mb-1">⚠️ Bağlantı Geçersiz</span>
            {tokenError}
          </div>
          <Link
            href="/sifremi-unuttum"
            className="w-full block text-center py-3 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow hover:bg-rose-500 transition"
          >
            Yeni Sıfırlama Bağlantısı İste
          </Link>
        </div>
      ) : success ? (
        <div className="space-y-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-2xl">
            ✅
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Şifreniz Başarıyla Değiştirildi!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Yeni şifrenizle hemen giriş yapabilirsiniz. 3 saniye içinde giriş sayfasına yönlendiriliyorsunuz…
          </p>
          <Link
            href="/giris"
            className="w-full block py-3 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow hover:bg-rose-500 transition"
          >
            Hemen Giriş Yap
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Yeni Şifre
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="En az 6 karakter"
                disabled={submitting}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-sm select-none"
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Yeni Şifre (Tekrar)
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Şifreyi tekrar yazın"
              disabled={submitting}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              required
            />
          </div>

          {submitError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/20 active:scale-[0.99] transition disabled:opacity-50"
          >
            {submitting ? "Güncelleniyor..." : "Şifreyi Kaydet ve Giriş Yap"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 transition-colors">
      <Suspense fallback={<div className="text-slate-500 text-sm">Yükleniyor…</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
