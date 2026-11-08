"use client";

// Legacy "ADMIN FLOATING BAR" (index.html:315-321). Metin kaynaktaki gibi "Admin Radar Modu".

export function AdminFloatingBar({ onPanel, onLogout }: { onPanel: () => void; onLogout: () => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#0c1020] border border-rose-500 text-white shadow-2xl rounded-2xl px-4 py-2">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span className="text-xs font-mono font-bold">Admin Radar Modu</span>
      <button type="button" onClick={onPanel} className="text-xs font-bold px-2.5 py-1 bg-rose-600 text-white rounded-lg ml-1">
        Panel
      </button>
      <button type="button" onClick={onLogout} className="text-xs text-slate-400 hover:text-rose-400 ml-1">
        Çıkış
      </button>
    </div>
  );
}
