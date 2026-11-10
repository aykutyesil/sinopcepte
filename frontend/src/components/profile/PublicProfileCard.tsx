"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { avatarEmoji } from "@/lib/avatars";
import { formatJoinDate } from "@/lib/format";
import type { Item, PublicProfile, AuthUser } from "@/lib/types";
import { instagramUrl, validateInstagram } from "@/lib/validation";
import { getOwnedVenues } from "@/lib/venue-profile";
import { fetchMe, isAdmin as checkIsAdmin } from "@/lib/client-api";
import { CARD } from "../auth/ui";

interface AdminUserDetail {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  role: string;
  checkinVisibility: string;
  anonymousMode: boolean;
  createdAt: string;
  checkinCount: number;
  lobbyCount: number;
  confessionCount: number;
  ownedVenues: string[];
}

/** Rozet şekli N8'de belirlenecek: dize ya da `{label|name|title, icon|emoji}` nesnesi savunmacı okunur. */
function badgeView(b: unknown, i: number): { key: string; icon: string | null; label: string } | null {
  if (typeof b === "string" && b.trim()) return { key: `${i}:${b}`, icon: null, label: b };
  if (b && typeof b === "object") {
    const o = b as Record<string, unknown>;
    const pick = (...ks: string[]) => {
      for (const k of ks) if (typeof o[k] === "string" && (o[k] as string).trim()) return o[k] as string;
      return null;
    };
    const label = pick("label", "name", "title", "key");
    if (!label) return null;
    return { key: `${i}:${label}`, icon: pick("icon", "emoji"), label };
  }
  return null;
}

export function PublicProfileCard({
  profile,
  items = [],
}: {
  profile: PublicProfile;
  items?: readonly Item[];
}) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [adminDetail, setAdminDetail] = useState<AdminUserDetail | null>(null);

  useEffect(() => {
    fetchMe()
      .then((u) => {
        setCurrentUser(u);
        if (checkIsAdmin(u)) {
          fetch("/api/admin/users")
            .then((r) => (r.ok ? r.json() : []))
            .then((allUsers: AdminUserDetail[]) => {
              const match = allUsers.find(
                (x) => x.username.toLowerCase() === profile.handle.toLowerCase()
              );
              if (match) setAdminDetail(match);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [profile.handle]);

  const joined = formatJoinDate(profile.createdAt);
  const ig = profile.instagram && !validateInstagram(profile.instagram) ? profile.instagram : null;
  const badges = (Array.isArray(profile.badges) ? profile.badges : [])
    .map(badgeView)
    .filter((b): b is NonNullable<typeof b> => b !== null);

  const ownedVenues = getOwnedVenues(profile.handle, items);
  const isAdminViewer = checkIsAdmin(currentUser);

  return (
    <div className="space-y-4">
      {/* 🛡️ ADMIN DENETİM KARTI (Sadece Admin Görür - Tanrı Modu) */}
      {isAdminViewer && (
        <section className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-amber-950/40 via-slate-900 to-[#080b18] border-2 border-amber-500/60 shadow-xl shadow-amber-950/30 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-pulse">🛡️</span>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-amber-300 font-display uppercase tracking-wide">
                  Admin Denetim Kartı (Gizli Bilgiler)
                </h2>
                <p className="text-[10px] text-amber-200/70">
                  Bu kutuyu sitede sadece sen ve sistem yöneticileri görebilir.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
              GOD MODE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block">E-Posta Adresi:</span>
              <span className="text-white font-bold break-all">
                {adminDetail?.email || "Kayıtlı değil"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block">Telefon Numarası:</span>
              {adminDetail?.phone ? (
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${adminDetail.phone}`}
                    className="text-emerald-400 hover:underline font-bold"
                  >
                    📞 {adminDetail.phone}
                  </a>
                  <a
                    href={`https://wa.me/${adminDetail.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-[10px] text-emerald-300 hover:bg-emerald-900"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              ) : (
                <span className="text-slate-500">Kayıtlı değil</span>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block">Rol & Yetki:</span>
              <span className="text-amber-400 font-bold">
                {adminDetail?.role === "ADMIN" ? "🛡️ SİSTEM YÖNETİCİSİ (ADMIN)" : "👤 Standart Üye (USER)"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block">Gizlilik Tercihleri:</span>
              <span className="text-slate-200">
                Check-in: <strong className="text-cyan-400">{adminDetail?.checkinVisibility || "PUBLIC"}</strong> | Anonim Mod: <strong className={adminDetail?.anonymousMode ? "text-rose-400" : "text-slate-400"}>{adminDetail?.anonymousMode ? "AÇIK" : "KAPALI"}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-around p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Toplam Check-in</span>
              <strong className="text-cyan-400 font-mono text-sm">{adminDetail?.checkinCount ?? 0}</strong>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 block">Açtığı Masa (Okeye 4)</span>
              <strong className="text-amber-400 font-mono text-sm">{adminDetail?.lobbyCount ?? 0}</strong>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 block">Yazdığı İtiraf</span>
              <strong className="text-rose-400 font-mono text-sm">{adminDetail?.confessionCount ?? 0}</strong>
            </div>
          </div>
        </section>
      )}

      <section className={CARD}>
        <div className="flex flex-col items-center text-center">
          <div className="story-ring">
            <div className="w-24 h-24 rounded-full bg-[#0f1428] flex items-center justify-center text-5xl" aria-hidden="true">
              {avatarEmoji(profile.avatar)}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            <h1 className="text-2xl font-black text-white font-display break-all">@{profile.handle}</h1>
            {ownedVenues.length > 0 && (
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                <span>👑</span>
                <span>Mekan Patronu</span>
              </span>
            )}
          </div>
          {joined && <p className="text-xs text-slate-400 mt-1">{joined} tarihinde katıldı</p>}
          {profile.bio && (
            <p className="mt-4 text-sm text-slate-200 whitespace-pre-line break-words max-w-full">{profile.bio}</p>
          )}
          {ig && (
            <a
              href={instagramUrl(ig)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 max-w-full text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-pink-300 transition"
            >
              <span aria-hidden="true">📸</span>
              <span className="truncate">@{ig}</span>
            </a>
          )}
        </div>
      </section>

      {/* Sahibi Olduğu Mekanlar */}
      {ownedVenues.length > 0 && (
        <section className={CARD}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🏪</span>
            <div>
              <h2 className="text-sm font-black text-white">Sahibi Olduğu Mekanlar ({ownedVenues.length})</h2>
              <p className="text-[11px] text-slate-400">Onaylı patron temsilcisi olduğu mekan profilleri</p>
            </div>
          </div>
          <div className="space-y-2">
            {ownedVenues.map((v) => (
              <Link
                key={v.itemId}
                href={`/mekan/${v.itemId}`}
                className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#080b18] border border-amber-500/30 hover:border-amber-400 flex items-center justify-between gap-3 group transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate">
                      {v.title}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/30">
                      {v.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">📍 {v.location}</p>
                </div>
                <span className="text-xs font-bold text-amber-400 shrink-0 group-hover:translate-x-1 transition">
                  Mekan Profili & Menü →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={CARD}>
        <h2 className="text-sm font-black text-white mb-3">Rozetler</h2>
        {badges.length === 0 && ownedVenues.length === 0 ? (
          <p className="text-xs text-slate-400">Henüz rozet yok</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {ownedVenues.length > 0 && (
              <li className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                👑 Mekan Patronu
              </li>
            )}
            {badges.map((b) => (
              <li
                key={b.key}
                className="text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 max-w-full truncate"
              >
                {b.icon && <span className="mr-1">{b.icon}</span>}
                {b.label}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
