"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Item, AuthUser } from "@/lib/types";
import { fetchMe } from "@/lib/client-api";
import { avatarEmoji } from "@/lib/avatars";
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

const AVATAR_OPTIONS = [
  "🕊️", "🐟", "🗼", "🏰", "🌊", "😎", "👑", "🎧", "⚡", "✨", "🎸", "🍕", "🍺", "☕", "🍔", "🎲"
];

export function CheckInModal({
  item,
  currentUser,
  onClose,
  onUpdate,
}: {
  item: Item;
  currentUser?: AuthUser | null;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [allStates, setAllStates] = useState(getCheckInState);
  const myCheckIn = getMyActiveCheckIn();

  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("😎");
  const [note, setNote] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<AuthUser | null>(currentUser ?? null);
  const [successMsg, setSuccessMsg] = useState("");

  const currentHandle = (loggedInUser?.handle || loggedInUser?.username || "").toLowerCase();
  const isCheckedInHere =
    myCheckIn?.venueId === item.id &&
    (!currentHandle || (myCheckIn?.handle || "").toLowerCase() === currentHandle);

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

  // Oturum açan kullanıcının bilgilerini otomatik doldur
  useEffect(() => {
    const applyUser = (me: AuthUser) => {
      setLoggedInUser(me);
      const userHandle = (me.handle || me.username || "").replace(/^@/, "");
      if (userHandle) {
        setHandle(userHandle);
        setDisplayName(userHandle);
      }
      if (me.avatar) {
        setAvatar(avatarEmoji(me.avatar));
      }
    };

    if (currentUser && (currentUser.handle || currentUser.username)) {
      applyUser(currentUser);
    } else {
      fetchMe().then((me) => {
        if (me && (me.handle || me.username)) {
          applyUser(me);
        } else {
          const savedHandle = localStorage.getItem("sinopcepte_my_handle");
          if (savedHandle) {
            setHandle(savedHandle);
            setDisplayName(savedHandle);
          }
        }
      });
    }
  }, [currentUser]);

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();

    const rawHandle = handle.trim().replace(/^@/, "");
    const finalHandle = isAnonymous
      ? "gizli_marti_" + Math.floor(100 + Math.random() * 900)
      : rawHandle || (loggedInUser?.handle || loggedInUser?.username || "").replace(/^@/, "") || "sinoplu_" + Math.floor(1000 + Math.random() * 9000);

    const finalName = isAnonymous
      ? "Gizli Sinoplu 🤫"
      : displayName.trim() || rawHandle || (loggedInUser?.handle || loggedInUser?.username || "").replace(/^@/, "") || "Sinoplu";

    if (!isAnonymous && rawHandle) {
      try {
        localStorage.setItem("sinopcepte_my_handle", rawHandle);
      } catch {}
    }

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
    if (!isAnonymous) {
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

    // Kendi aktif mekanımı kaydet
    setMyActiveCheckIn({
      venueId: item.id,
      venueTitle: item.title,
      venueName: item.title,
      handle: finalHandle,
      timestamp: Date.now(),
    });

    setSuccessMsg(`🎉 @${finalHandle} olarak check-in yapıldı!`);
    onUpdate();

    setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
  };

  const handleCheckOut = () => {
    clearMyActiveCheckIn();

    // Aktif kullanıcılardan kendimi çıkar
    const userH = myCheckIn?.handle || (loggedInUser?.handle || loggedInUser?.username || "").replace(/^@/, "");
    const updatedUsers = venueData.activeUsers.filter((u) => u.handle !== userH);

    const nextAll = {
      ...allStates,
      [item.id]: {
        ...venueData,
        activeUsers: updatedUsers,
      },
    };

    saveCheckInState(nextAll);
    setAllStates(nextAll);
    onUpdate();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0b0e1e] border border-cyan-500/30 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Kapat butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
        >
          ✕
        </button>

        {/* Başlık ve Mekan Bilgisi */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📍</span>
            <h3 className="text-lg font-black text-white font-display truncate">{item.title}</h3>
          </div>
          <p className="text-xs text-slate-400">{item.location}</p>
        </div>

        {/* Başarı Bildirimi */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
            <span>✨</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* 👑 MAYOR (MEKANIN MUHTARI) KARTI */}
        <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-transparent border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <span className="text-3xl p-1 block">{venueData.mayor.avatar}</span>
              <span className="absolute -top-1 -right-1 text-sm">👑</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-black text-amber-400">
                  Mekan Muhtarı
                </span>
                <span className="text-[10px] text-amber-300/80 font-mono">
                  ({venueData.mayor.checkInCount} check-in)
                </span>
              </div>
              <Link
                href={`/u/${venueData.mayor.handle}`}
                className="text-sm font-bold text-white hover:text-amber-300 transition flex items-center gap-1 group/m truncate"
                title={`@${venueData.mayor.handle} profilini görüntüle`}
              >
                <span className="truncate">{venueData.mayor.displayName}</span>
                <span className="text-[11px] text-slate-400 group-hover/m:text-amber-300 font-mono">
                  @{venueData.mayor.handle}
                </span>
                <span className="text-[10px] opacity-0 group-hover/m:opacity-100 text-amber-400 transition">↗</span>
              </Link>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-slate-400 font-mono">Toplam Ziyaret</div>
            <div className="text-sm font-bold text-amber-300 font-mono">{venueData.totalVisits} kez</div>
            <Link
              href={`/u/${venueData.mayor.handle}`}
              className="inline-block mt-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 underline"
            >
              Profili Gör
            </Link>
          </div>
        </div>

        {/* 👥 ŞU AN BURADA OLANLAR LİSTESİ */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
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
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition group/user"
                >
                  <Link
                    href={`/u/${u.handle}`}
                    className="flex items-center gap-2.5 min-w-0 hover:opacity-90 transition flex-1"
                    title={`@${u.handle} profilini görüntüle`}
                  >
                    <span className="text-xl shrink-0 p-1 rounded-lg bg-slate-800 group-hover/user:scale-105 transition">{u.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate group-hover/user:text-cyan-300 transition">
                          {u.displayName || u.handle}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono truncate">
                          @{u.handle}
                        </span>
                      </div>
                      {u.note && (
                        <p className="text-[11px] text-cyan-300/90 truncate italic">
                          &ldquo;{u.note}&rdquo;
                        </p>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatTimeAgo(u.timestamp)}
                    </span>
                    <Link
                      href={`/u/${u.handle}`}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
                    >
                      Profil →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 📍 CHECK-IN AKSIYON FORMU */}
        <div className="pt-3 border-t border-slate-800">
          {isCheckedInHere ? (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl shrink-0">✅</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-emerald-300 truncate">
                    Şu an <Link href={`/u/${myCheckIn!.handle}`} className="underline hover:text-white font-mono">@{myCheckIn!.handle}</Link> olarak buradasın!
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {formatTimeAgo(myCheckIn!.timestamp)} check-in yapıldı
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckOut}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-xs transition shrink-0"
              >
                Çıkış Yap
              </button>
            </div>
          ) : (
            <form onSubmit={handleCheckIn} className="space-y-2.5">
              <div className="flex gap-2">
                <div className="w-24 shrink-0">
                  <label className="block text-[10px] font-mono text-slate-300 mb-1 font-semibold">Avatar</label>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-mono text-slate-300 font-bold">Rumuz / İsim</label>
                    {loggedInUser && (
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                        ✓ @{loggedInUser.handle || loggedInUser.username}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => {
                      setHandle(e.target.value);
                      setDisplayName(e.target.value);
                    }}
                    placeholder={loggedInUser?.handle ? `@${loggedInUser.handle}` : "Örn: aykut_sn"}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
                    required={!isAnonymous}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-300 mb-1 font-semibold">Check-in Notu (İsteğe Bağlı)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Burada ne yapıyorsun? (Örn: Maçtayız, terasta kahve...)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Anonim Seçeneği */}
              <label className="flex items-center gap-2 cursor-pointer pt-1 text-[11px] text-slate-400 hover:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-0"
                />
                <span>🤫 Anonim Check-In Yap (İsmimi gizle)</span>
              </label>

              {myCheckIn && (
                <p className="text-[10px] text-amber-400/90 font-mono">
                  ⚠️ Başka bir mekanda ({myCheckIn.venueName}) aktif check-in&apos;in var. Buraya check-in yaparsan orası sonlanacak.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
              >
                📍 Buradayım! (Check-in Yap)
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
