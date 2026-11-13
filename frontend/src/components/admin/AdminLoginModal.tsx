"use client";

import { useState } from "react";
import { ApiError, isAdmin, login } from "@/lib/client-api";

// Legacy "ŞİFRELİ GİRİŞ MODALI" (index.html:323-334). Legacy yalnız şifre soruyordu ve
// istemcide `1234` ile karşılaştırıyordu; artık kullanıcı adı + şifre backend oturumuna gider.

export function AdminLoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const user = await login(username.trim(), password);
      if (!isAdmin(user)) {
        setError("Bu hesabın yönetici yetkisi yok.");
        return;
      }
      onSuccess();
    } catch (e) {
      setError(e instanceof ApiError && (e.status === 401 || e.status === 400) ? "Hatalı şifre!" : "Sunucuya ulaşılamadı.");
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-[#0f1428] border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base text-white">Yönetici Girişi</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-lg" aria-label="Kapat">
            ✕
          </button>
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={onKey}
          placeholder="Kullanıcı adı"
          autoComplete="username"
          autoFocus
          className="w-full bg-[#070914] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-rose-500"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKey}
            placeholder="Şifrenizi yazın"
            autoComplete="current-password"
            className="w-full bg-[#070914] border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-hidden focus:border-rose-500"
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
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm disabled:opacity-60"
        >
          Giriş Yap
        </button>
      </div>
    </div>
  );
}
