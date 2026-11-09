"use client";

import { useState } from "react";
import type { Item } from "@/lib/types";
import {
  formatTimeAgo,
  getCheckInState,
  getMyActiveCheckIn,
  saveCheckInState,
  setMyActiveCheckIn,
  clearMyActiveCheckIn,
  type VenueCheckInState,
  type CheckInUser,
} from "@/lib/checkin";

const AVATAR_OPTIONS = ["👑", "🌊", "☕", "🍔", "🎧", "⚡", "✨", "🎸", "🍕", "🍺"];

export function CheckInModal({
  item,
  onClose,
  onUpdate,
}: {
  item: Item;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [allStates, setAllStates] = useState(getCheckInState);
  const myCheckIn = getMyActiveCheckIn();
  const isCheckedInHere = myCheckIn?.venueId === item.id;

  const venueData: VenueCheckInState = allStates[item.id] || {
    venueId: item.id,
    totalVisits: 1,
    mayor: {
      handle: "sinoplu",
      displayName: "Sinoplu",
      avatar: "👑",
      checkInCount: 1,
    },
    activeUsers: [],
  };

  const [handle, setHandle] = useState("");
  const [avatar, setAvatar] = useState("👑");
  const [note, setNote] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const finalHandle = handle.trim() || "misafir_" + Math.floor(1000 + Math.random() * 9000);
    const finalName = handle.trim() ? handle.trim() : "Misafir";

    const newUser: CheckInUser = {
      id: "u-" + Date.now(),
      handle: finalHandle,
      displayName: finalName,
      avatar: avatar,
      note: note.trim() || undefined,
      timestamp: Date.now(),
    };

    // Güncel mekanda var olan eski kaydını çıkarıp yenisini en başa ekle
    const updatedUsers = [newUser, ...venueData.activeUsers.filter((u) => u.handle !== finalHandle)];
    const newTotal = venueData.totalVisits + 1;

    // Mayor kontrolü: Eğer kullanıcının toplam check-in'i mevcut mayor'ı geçerse yeni mayor olur
    let updatedMayor = venueData.mayor;
    if (finalHandle === venueData.mayor.handle) {
      updatedMayor = {
        ...venueData.mayor,
        checkInCount: venueData.mayor.checkInCount + 1,
      };
    } else if (venueData.mayor.checkInCount <= 1) {
      updatedMayor = {
        handle: finalHandle,
        displayName: finalName,
        avatar: avatar,
        checkInCount: 2,
      };
    }

    const nextAll = {
      ...allStates,
      [item.id]: {
        ...venueData,
        totalVisits: newTotal,
        mayor: updatedMayor,
        activeUsers: updatedUsers,
      },
    };

    saveCheckInState(nextAll);
    setAllStates(nextAll);

    setMyActiveCheckIn({
      venueId: item.id,
      venueTitle: item.title,
      note: note.trim() || undefined,
      timestamp: Date.now(),
    });

    setSuccessMsg("🎉 Harika! " + item.title + " mekanına başarıyla check-in yaptın.");
    onUpdate();
  };

  const handleCheckOut = () => {
    const updatedUsers = venueData.activeUsers.filter(
      (u) => u.handle !== myCheckIn?.venueTitle && u.timestamp !== myCheckIn?.timestamp
    );

    const nextAll = {
      ...allStates,
      [item.id]: {
        ...venueData,
        activeUsers: updatedUsers,
      },
    };

    saveCheckInState(nextAll);
    setAllStates(nextAll);
    clearMyActiveCheckIn();
    setSuccessMsg("👋 Mekandan çıkış yapıldı.");
    onUpdate();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0f1428] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative space-y-4 my-auto">
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
        >
          ✕
        </button>

        {/* Mekan Başlığı */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              📍 SWARM CHECK-IN
            </span>
            <span className="text-xs text-slate-400">{item.location}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{item.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Şu an mekanda kimler var ve mekanın lideri kim?</p>
        </div>

        {/* Başarı Bildirimi */}
        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-pulse">
            {successMsg}
          </div>
        )}

        {/* 👑 MEKANIN MAYOR'I (MÜDAVİMİ) KARTI */}
        <div className="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-amber-950/60 via-[#181a30] to-amber-950/40 border-2 border-amber-500/40 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-2xl shadow-inner shrink-0 relative">
                <span>{venueData.mayor.avatar}</span>
                <span className="absolute -top-2 -right-1 text-sm animate-bounce">👑</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-extrabold text-amber-400 uppercase tracking-wider">
                    Mekanın Mayor'ı
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white truncate">
                  {venueData.mayor.displayName} <span className="text-xs text-slate-400 font-normal">(@{venueData.mayor.handle})</span>
                </h3>
                <p className="text-[11px] text-amber-300/80 font-mono">
                  Son 30 günde <b>{venueData.mayor.checkInCount}</b> check-in • Mekanın müdavimi
                </p>
              </div>
            </div>
            <div className="hidden xs:flex flex-col items-end shrink-0">
              <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/40">
                LİDER
              </span>
            </div>
          </div>
        </div>

        {/* 👥 ŞU AN MEKANDAKİLER LİSTESİ */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Şu An Burada ({venueData.activeUsers.length} kişi)
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Son 3 saat</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {venueData.activeUsers.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-500">
                Henüz kimse check-in yapmadı. İlk sen ol!
              </div>
            ) : (
              venueData.activeUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0 p-1 rounded-lg bg-slate-800">{u.avatar}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">{u.displayName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">@{u.handle}</span>
                      </div>
                      {u.note && (
                        <p className="text-[11px] text-cyan-300/90 truncate italic">
                          "{u.note}"
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 pl-2">
                    {formatTimeAgo(u.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 📍 CHECK-IN AKSIYON FORMU */}
        <div className="pt-3 border-t border-slate-800">
          {isCheckedInHere ? (
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <div>
                  <div className="text-xs font-bold text-emerald-300">Şu an bu mekandasın!</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {formatTimeAgo(myCheckIn!.timestamp)} check-in yapıldı
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckOut}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-xs transition"
              >
                Çıkış Yap
              </button>
            </div>
          ) : (
            <form onSubmit={handleCheckIn} className="space-y-2.5">
              <div className="flex gap-2">
                <div className="w-24 shrink-0">
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Avatar</label>
                  <select
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    {AVATAR_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Rumuz / İsim</label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="Örn: aykut_sn"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">Check-in Notu (İsteğe Bağlı)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Burada ne yapıyorsun? (Örn: Maçtayız, terasta kahve...)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {myCheckIn && (
                <p className="text-[10px] text-amber-400/90 font-mono">
                  ⚠️ Şu an "{myCheckIn.venueTitle}" mekanındasın. Buraya check-in yaparsan önceki sonlanır.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>📍</span>
                <span>Buradayım! (Check-in Yap)</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
