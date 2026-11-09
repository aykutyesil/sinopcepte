import Link from "next/link";
import type { ReactNode } from "react";

// Giriş/kayıt/profil sayfalarının ortak kabuğu ve form parçaları. Görsel dil Dock ve admin
// modallarından: koyu lacivert zemin, slate kenarlıklar, rose vurgu, rounded-2xl/3xl kartlar.

export const INPUT =
  "w-full min-w-0 bg-[#070914] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-rose-500 disabled:opacity-60";
export const INPUT_ERROR = "border-rose-500";
export const PRIMARY_BTN =
  "w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition disabled:opacity-60";
export const SECONDARY_BTN =
  "py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition disabled:opacity-60";
export const CARD = "bg-[#0f1428] border border-slate-800 rounded-3xl p-5 sm:p-6";

export function AuthShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col">
      <header className="border-b border-slate-800 bg-[#070910]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0" title="Ana sayfaya dön">
            <span className="w-9 h-9 rounded-2xl bg-linear-to-tr/srgb from-rose-500 via-purple-600 to-cyan-400 flex items-center justify-center text-base shadow-lg shrink-0">
              📡
            </span>
            <span className="text-lg font-black tracking-tight text-white font-display truncate">
              Sinop<span className="text-rose-500">Cepte</span>
            </span>
          </Link>
          <Link href="/" className="text-xs font-bold text-slate-400 hover:text-white shrink-0">
            ← Akışa dön
          </Link>
        </div>
      </header>
      <main className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} mx-auto px-4 py-6 sm:py-10 flex-1`}>{children}</main>
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string | null }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs text-rose-400" role="alert">
      {message}
    </p>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2" role="alert">
      {message}
    </p>
  );
}

export function FormSuccess({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2" role="status">
      {message}
    </p>
  );
}

export function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-bold text-slate-400 mb-1">
      {children}
    </label>
  );
}
