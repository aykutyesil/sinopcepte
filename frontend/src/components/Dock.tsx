"use client";

import type { FeedFilter } from "@/lib/types";
import { useSecretClick } from "@/hooks/useSecretClick";
import { useThemePreference } from "@/hooks/useThemePreference";

// Legacy sol dock (index.html:76-139).

const NAV: { filter: FeedFilter; icon: string; label: string }[] = [
  { filter: "all", icon: "⚡", label: "Canlı Akış (Tümü)" },
  { filter: "etkinlik", icon: "⚽", label: "Maç & Canlı Sahne" },
  { filter: "mekan", icon: "🍸", label: "Mekan & Kafe" },
  { filter: "taksi", icon: "🚖", label: "7/24 Taksi" },
  { filter: "tekel", icon: "🏪", label: "Gece Açık Tekel" },
  { filter: "eczane", icon: "💊", label: "Nöbetçi Eczane" },
  { filter: "cicek", icon: "💐", label: "Çiçek & Hediye" },
];

// İlk HTML'deki (94 ve 99. satır) sınıflar. Legacy `filterFeed` tıklamadan sonra duyarlı
// sınıfları düşüren farklı bir dize yazıyordu (hata); burada her durumda işaretlemedeki dize kullanılır.
const ACTIVE =
  "w-full p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-rose-600 text-white font-bold text-xs flex items-center justify-center md:justify-start gap-3 transition";
const INACTIVE =
  "w-full p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-slate-400 hover:text-white hover:bg-slate-900 font-semibold text-xs flex items-center justify-center md:justify-start gap-3 transition";

export function Dock({
  filter,
  onFilter,
  onSecretTrigger,
}: {
  filter: FeedFilter;
  onFilter: (f: FeedFilter) => void;
  onSecretTrigger: () => void;
}) {
  const onLogoClick = useSecretClick(onSecretTrigger);
  const theme = useThemePreference();

  return (
    <aside className="w-14 sm:w-20 md:w-60 shrink-0 border-r border-slate-800 bg-[#070910] p-1.5 xs:p-2 sm:p-4 flex flex-col justify-between sticky top-0 h-screen z-30">
      <div>
        {/* Marka / Logo (3 Tık Admin) */}
        <div
          className="flex items-center space-x-3 cursor-pointer select-none mb-5 sm:mb-8 px-0.5 sm:px-1"
          onClick={onLogoClick}
          title="SinopCepte Yönetici Girişi İçin 3 Tık"
          data-testid="secret-logo"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-linear-to-tr/srgb from-rose-500 via-purple-600 to-cyan-400 flex items-center justify-center font-black text-white text-base sm:text-lg shadow-lg shrink-0">
            📡
          </div>
          <div className="hidden md:block">
            <span className="text-lg font-black tracking-tight text-white font-display">
              Sinop<span className="text-rose-500">Radar</span>
            </span>
            <span className="block text-[9px] font-mono text-cyan-400 font-bold uppercase">Canlı Şehir Akışı</span>
          </div>
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
              <span className="hidden md:inline">{n.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Alt Araçlar: Tema */}
      <div className="pt-3 sm:pt-4 border-t border-slate-800 space-y-2">
        <button
          type="button"
          onClick={theme.toggle}
          className="w-full p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center md:justify-start gap-2 transition"
          title="Görünüm Modu"
        >
          <span>{theme.icon}</span>
          <span className="hidden md:inline">Görünüm Modu</span>
        </button>
      </div>
    </aside>
  );
}
