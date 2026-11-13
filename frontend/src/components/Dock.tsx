"use client";

import Link from "next/link";
import { avatarEmoji } from "@/lib/avatars";
import type { AuthUser, FeedFilter } from "@/lib/types";
import { isAdmin as hasAdminRole, logout } from "@/lib/client-api";
import { useSecretClick } from "@/hooks/useSecretClick";
import { useThemePreference } from "@/hooks/useThemePreference";
import { useNotifications } from "@/hooks/useNotifications";

// Legacy sol dock (index.html:76-139).

const NAV: { filter: FeedFilter; icon: string; label: string; badge?: string }[] = [
  { filter: "mekan", icon: "🍸", label: "Mekan Rehberi", badge: "ANA" },
  { filter: "itiraf", icon: "🤫", label: "Gece İtirafları", badge: "CANLI" },
  { filter: "okeye4", icon: "🀄", label: "Okeye 4. Masaları" },
  { filter: "ilan", icon: "🏷️", label: "2. El & Öğrenci Pazarı" },
  { filter: "kampus", icon: "🎓", label: "SNÜ Kampüs & Notlar", badge: "YENİ" },
  { filter: "etkinlik", icon: "⚽", label: "Maç & Canlı Sahne" },
  { filter: "taksi", icon: "🚖", label: "7/24 Taksi" },
  { filter: "tekel", icon: "🏪", label: "Gece Açık Tekel" },
  { filter: "eczane", icon: "💊", label: "Nöbetçi Eczane" },
  { filter: "cicek", icon: "💐", label: "Çiçek & Hediye" },
  { filter: "kesfet", icon: "🌟", label: "Özellikler & Rehber" },
];

const ACTIVE =
  "w-full p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-rose-600 text-white font-bold text-xs flex items-center justify-center md:justify-start gap-3 transition shadow-md shadow-rose-500/25";

const TOOL =
  "w-full min-w-0 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center md:justify-start gap-2 transition";

const INACTIVE =
  "w-full p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold text-xs flex items-center justify-center md:justify-start gap-3 transition";

export function Dock({
  filter,
  onFilter,
  onSecretTrigger,
  onOpenNotifications,
  me,
}: {
  filter: FeedFilter;
  onFilter: (f: FeedFilter) => void;
  onSecretTrigger: () => void;
  onOpenNotifications?: () => void;
  /** `undefined` = oturum durumu henüz bilinmiyor (yer tutucu), `null` = oturum yok. */
  me: AuthUser | null | undefined;
}) {
  const isAdmin = hasAdminRole(me ?? null);
  const secretClick = useSecretClick(onSecretTrigger);
  const onLogoClick = isAdmin ? onSecretTrigger : secretClick;
  const theme = useThemePreference();
  const { unreadCount } = useNotifications();

  return (
    <aside className="w-14 sm:w-20 md:w-60 shrink-0 border-r border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#070910] p-1.5 xs:p-2 sm:p-4 flex flex-col justify-between sticky top-0 h-screen self-start overflow-y-auto no-scrollbar z-30 transition-colors">
      <div>
        {/* Marka / Logo (Admin için tek tık, diğerleri için 3 Tık) */}
        <div
          className="flex items-center space-x-3 cursor-pointer select-none mb-3 sm:mb-5 px-0.5 sm:px-1"
          onClick={onLogoClick}
          title={isAdmin ? "Yönetim Panelini Aç (Tek Tık)" : "SinopCepte Yönetici Girişi İçin 3 Tık"}
          data-testid="secret-logo"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-cyan-500 flex items-center justify-center font-black text-white text-base sm:text-lg shadow-md shrink-0">
            📡
          </div>
          <div className="hidden md:block">
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white font-display">
              Sinop<span className="text-rose-500">Cepte</span>
            </span>
            <span className="block text-[9px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase">Canlı Şehir Akışı</span>
          </div>
        </div>

        {/* 📖 AYKUT BURAYI OKU (Öne Çıkarılmış Kılavuz) */}
        <div className="mb-2.5">
          <Link
            href="/aykut-burayi-oku"
            className="w-full p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-50 via-blue-50 to-purple-50 dark:from-cyan-950/80 dark:via-blue-950/60 dark:to-purple-950/70 border border-cyan-200/90 dark:border-cyan-400/60 hover:border-cyan-400 text-cyan-800 dark:text-cyan-200 hover:text-cyan-950 dark:hover:text-white font-black text-xs flex items-center justify-center md:justify-start gap-2.5 transition group shadow-xs"
            title="Aykut İçin Proje Durumu & Rehberi"
          >
            <span className="text-base sm:text-lg group-hover:scale-115 transition shrink-0">📖</span>
            <span className="hidden md:inline font-black tracking-tight truncate">Aykut Burayı Oku</span>
          </Link>
        </div>

        {/* 🛡️ ADMIN PANELİ BUTONU (Yöneticiler için doğrudan erişim) */}
        {isAdmin && (
          <div className="mb-2">
            <button
              type="button"
              onClick={onSecretTrigger}
              className="w-full p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/20 dark:via-orange-500/20 dark:to-amber-600/30 border border-amber-300 dark:border-amber-500/50 hover:border-amber-400 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center md:justify-start gap-2.5 transition group shadow-xs active:scale-98"
              title="Yönetim Panelini Aç"
            >
              <span className="text-base sm:text-lg group-hover:scale-110 transition shrink-0">🛡️</span>
              <span className="hidden md:inline font-bold truncate">Yönetim Paneli</span>
            </button>
          </div>
        )}

        {/* 🔔 BİLDİRİMLER BUTONU (Öne Çıkarılmış) */}
        <div className="mb-3">
          <button
            type="button"
            onClick={onOpenNotifications}
            className="w-full p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-50/80 via-purple-50/60 to-slate-100 dark:from-rose-950/80 dark:via-purple-950/50 dark:to-slate-900 border border-rose-200 dark:border-rose-500/50 hover:border-rose-300 dark:hover:border-rose-400 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center md:justify-between transition group shadow-xs active:scale-98"
            title="Canlı Bildirimler"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-base sm:text-lg group-hover:scale-110 transition shrink-0">🔔</span>
              <span className="hidden md:inline font-bold truncate">Bildirimler</span>
            </div>
            {unreadCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black animate-pulse shadow shrink-0">
                {unreadCount}
              </span>
            ) : (
              <span className="hidden md:inline text-[10px] text-slate-500 dark:text-slate-400 font-mono">0</span>
            )}
          </button>
        </div>

        {/* Dikey Menü Butonları */}
        <nav className="space-y-1.5">
          {NAV.map((n) => (
            <button
              key={n.filter}
              type="button"
              onClick={() => onFilter(n.filter)}
              className={filter === n.filter ? ACTIVE : INACTIVE}
              title={n.label}
              aria-pressed={filter === n.filter}
            >
              <span className="text-base shrink-0">{n.icon}</span>
              <span className="hidden md:inline truncate">{n.label}</span>
              {n.badge && (
                <span className="hidden md:inline text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 ml-auto shrink-0 shadow-xs">
                  {n.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Alt Araçlar: Tema + Hesap */}
      <div className="space-y-2 pt-3 border-t border-slate-200/90 dark:border-slate-800/80">
        <button
          type="button"
          onClick={theme.toggle}
          className={`${TOOL} hidden sm:flex`}
          title={`Tema Değiştir (Şu an: ${theme.isDark ? "Koyu Mod" : "Açık Mod"})`}
          data-testid="theme-toggle"
        >
          <span className="shrink-0 text-base leading-none">{theme.isDark ? "☀️" : "🌙"}</span>
          <span className="hidden md:inline">{theme.isDark ? "Açık Mod" : "Koyu Mod"}</span>
        </button>

        <AccountButton me={me} />
      </div>
    </aside>
  );
}

function AccountButton({ me }: { me: AuthUser | null | undefined }) {
  const handle = me ? me.handle || me.username : "";
  if (me === undefined || (me && !handle)) {
    // Oturum bilinmeden "Giriş Yap" gösterilirse girişli kullanıcıda yanıp söner.
    return (
      <div className={`${TOOL} pointer-events-none`} aria-hidden="true" data-testid="account-placeholder">
        <span className="w-4 h-4 rounded-full bg-slate-800 animate-pulse shrink-0" />
        <span className="hidden md:inline h-3 w-20 rounded-sm bg-slate-800 animate-pulse" />
      </div>
    );
  }
  if (me === null) {
    return (
      <Link href="/giris" className={TOOL} title="Giriş Yap" data-testid="account-login">
        <span className="shrink-0">🔑</span>
        <span className="hidden md:inline">Giriş Yap</span>
      </Link>
    );
  }

  const handleSwitchUser = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await logout();
      localStorage.removeItem("sinopcepte_my_handle");
      localStorage.removeItem("sinopcepte_my_checkin");
    } catch {}
    window.location.href = "/giris";
  };

  return (
    <div className="space-y-1.5">
      <Link href={`/u/${handle}`} className={TOOL} title={`@${handle} — Profilimi Görüntüle`} data-testid="account-profile">
        <span className="shrink-0 text-base leading-none">{avatarEmoji(me.avatar)}</span>
        <span className="hidden md:inline truncate min-w-0 font-bold">@{handle}</span>
      </Link>
      <div className="flex items-center gap-1">
        <Link
          href="/profil"
          className="flex-1 min-w-0 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0b0e1e] dark:hover:bg-slate-800 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white text-[10px] font-bold flex items-center justify-center gap-1 transition border border-slate-200 dark:border-slate-800/80"
          title="Profil Ayarlarını Düzenle"
        >
          <span>⚙️</span>
          <span className="hidden md:inline truncate">Ayarlar</span>
        </Link>
        <button
          type="button"
          onClick={handleSwitchUser}
          className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-[#0b0e1e] dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 text-[10px] font-bold flex items-center justify-center gap-1 transition border border-slate-200 dark:border-slate-800/80"
          title="Oturumu Kapat ve Farklı Kullanıcıya Geç"
        >
          <span>🚪</span>
          <span className="hidden md:inline">Değiştir</span>
        </button>
      </div>
    </div>
  );
}
