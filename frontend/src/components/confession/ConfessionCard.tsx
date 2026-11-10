"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { avatarEmoji } from "@/lib/avatars";
import type { AuthUser } from "@/lib/types";
import {
  CONFESSION_CATEGORIES,
  type Confession,
  type ReactionType,
  reactConfession,
  addConfessionComment,
  reportConfession,
  deleteConfession,
} from "@/lib/confessions";

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return "az önce";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} dk önce`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} sa önce`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} gün önce`;
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export function ConfessionCard({
  confession,
  me,
  onDeleted,
  onUpdated,
}: {
  confession: Confession;
  me?: AuthUser | null;
  onDeleted?: () => void;
  onUpdated?: (c: Confession) => void;
}) {
  const router = useRouter();
  const [expandedComments, setExpandedComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [busyReaction, setBusyReaction] = useState(false);
  const [reported, setReported] = useState(false);

  const isLoggedIn = Boolean(me && (me.handle || me.username));
  const isAdmin = Boolean(me?.roles?.includes("ADMIN"));
  const canDelete = confession.isMine || isAdmin;

  const categoryInfo = CONFESSION_CATEGORIES[confession.category] || CONFESSION_CATEGORIES.gece;
  const timeFormatted = formatRelativeTime(confession.createdAt);

  const handleReact = async (type: ReactionType) => {
    if (!isLoggedIn) {
      router.push("/giris");
      return;
    }
    if (busyReaction) return;
    setBusyReaction(true);
    try {
      const updated = await reactConfession(confession.id, type);
      onUpdated?.(updated);
    } catch {
      alert("Tepki kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setBusyReaction(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/giris");
      return;
    }
    const trimmed = commentText.trim();
    if (!trimmed) return;

    setSubmittingComment(true);
    try {
      const newComment = await addConfessionComment(confession.id, trimmed, isAnonymous);
      setCommentText("");
      onUpdated?.({
        ...confession,
        comments: [...(confession.comments || []), newComment],
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Yorum gönderilemedi.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReport = async () => {
    if (!isLoggedIn) {
      router.push("/giris");
      return;
    }
    if (reported) return;
    const ok = window.confirm("Bu itirafı uygunsuz/kural ihlali gerekçesiyle bildirmek istiyor musunuz?");
    if (!ok) return;

    try {
      await reportConfession(confession.id);
      setReported(true);
      alert("Bildiriminiz yönetici ekibine iletildi. Teşekkürler!");
    } catch {
      alert("Şikayet gönderilemedi.");
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm("Bu itirafı silmek istediğinize emin misiniz?");
    if (!ok) return;

    try {
      await deleteConfession(confession.id);
      onDeleted?.();
    } catch {
      alert("İtiraf silinemedi.");
    }
  };

  const hasFire = confession.myReactions?.includes("FIRE");
  const hasLaugh = confession.myReactions?.includes("LAUGH");
  const hasShock = confession.myReactions?.includes("SHOCK");
  const hasHeart = confession.myReactions?.includes("HEART");

  return (
    <article
      data-testid="confession-card"
      className="p-4 sm:p-5 rounded-3xl bg-[#090c1a] border border-slate-800/80 hover:border-slate-700 transition shadow-lg space-y-3.5 relative overflow-hidden"
    >
      {/* Üst Başlık & Anonim Kimlik */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/30 flex items-center justify-center text-xl shadow-inner shrink-0 select-none">
            {avatarEmoji(confession.aliasAvatar)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-sm tracking-wide">
                {confession.aliasName}
              </span>
              {confession.isMine && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Senin İtirafın
                </span>
              )}
              {isAdmin && confession.realAuthorHandle && (
                <Link
                  href={`/u/${confession.realAuthorHandle}`}
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition flex items-center gap-1 shadow-sm"
                  title="Admin Özel Görünümü: Gerçek Yazar"
                >
                  <span>👁️</span>
                  <span>Gerçek: @{confession.realAuthorHandle}</span>
                  {confession.realAuthorPhone && (
                    <span className="text-[9px] text-emerald-400">({confession.realAuthorPhone})</span>
                  )}
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-400 font-mono">{timeFormatted}</span>
              <span className="text-slate-600">•</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryInfo.badgeClass}`}
              >
                {categoryInfo.icon} {categoryInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Aksiyon Menüsü (Şikayet / Sil) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition text-xs"
              title="İtirafı Sil"
            >
              🗑️
            </button>
          )}
          <button
            type="button"
            onClick={handleReport}
            disabled={reported}
            className={`p-1.5 rounded-xl transition text-xs ${
              reported
                ? "text-amber-500 bg-amber-500/10 cursor-default"
                : "text-slate-500 hover:text-amber-400 hover:bg-amber-500/10"
            }`}
            title={reported ? "Bildirildi" : "Şikayet Et"}
          >
            🚩
          </button>
        </div>
      </div>

      {/* İtiraf İçeriği */}
      <p className="text-sm sm:text-base text-slate-100 font-sans leading-relaxed whitespace-pre-wrap selection:bg-rose-500/30">
        {confession.body}
      </p>

      {/* Mekan / Konum Etiketi */}
      {confession.venueTitle && (
        <div className="pt-0.5">
          {confession.venueId ? (
            <Link
              href={`/mekan/${confession.venueId}`}
              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 hover:underline bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 transition"
            >
              <span>📍 #{confession.venueTitle}</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-slate-300 bg-slate-800/60 px-2.5 py-1 rounded-xl border border-slate-700/50">
              <span>📍 #{confession.venueTitle}</span>
            </span>
          )}
        </div>
      )}

      {/* Reaksiyonlar ve Yorum Çubuğu */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Tepki Butonları */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => handleReact("FIRE")}
            className={`px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1 border ${
              hasFire
                ? "bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-xs"
                : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
            }`}
            title="Ateş / Yakıcı"
          >
            <span>🔥</span>
            <span>{confession.fireCount}</span>
          </button>

          <button
            type="button"
            onClick={() => handleReact("LAUGH")}
            className={`px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1 border ${
              hasLaugh
                ? "bg-yellow-500/25 text-yellow-300 border-yellow-500/50 shadow-xs"
                : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
            }`}
            title="Kahkaha / Komik"
          >
            <span>😂</span>
            <span>{confession.laughCount}</span>
          </button>

          <button
            type="button"
            onClick={() => handleReact("SHOCK")}
            className={`px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1 border ${
              hasShock
                ? "bg-purple-500/25 text-purple-300 border-purple-500/50 shadow-xs"
                : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
            }`}
            title="Şok / İnanılmaz"
          >
            <span>😱</span>
            <span>{confession.shockCount}</span>
          </button>

          <button
            type="button"
            onClick={() => handleReact("HEART")}
            className={`px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1 border ${
              hasHeart
                ? "bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-xs"
                : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
            }`}
            title="Kalp / Sevgi"
          >
            <span>❤️</span>
            <span>{confession.heartCount}</span>
          </button>
        </div>

        {/* Yorumları Aç / Kapa Butonu */}
        <button
          type="button"
          onClick={() => setExpandedComments(!expandedComments)}
          className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold transition flex items-center gap-1.5"
        >
          <span>💬</span>
          <span>{confession.comments?.length || 0} Yorum</span>
          <span className="text-[10px] text-slate-500">
            {expandedComments ? "▲" : "▼"}
          </span>
        </button>
      </div>

      {/* Yorumlar Akordeon Alanı */}
      {expandedComments && (
        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          {/* Yorum Listesi */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {confession.comments && confession.comments.length > 0 ? (
              confession.comments.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm select-none">{avatarEmoji(c.aliasAvatar)}</span>
                      {c.isAnonymous || !c.authorHandle ? (
                        <span className="font-bold text-slate-300">{c.aliasName}</span>
                      ) : (
                        <Link
                          href={`/u/${c.authorHandle}`}
                          className="font-bold text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <span>@{c.authorHandle}</span>
                          <span className="text-[10px] text-slate-500">({c.aliasName})</span>
                        </Link>
                      )}
                      {isAdmin && c.realAuthorHandle && c.isAnonymous && (
                        <Link
                          href={`/u/${c.realAuthorHandle}`}
                          className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:underline"
                          title="Admin Görünümü: Yorumun Gerçek Yazarı"
                        >
                          👁️ @{c.realAuthorHandle}
                        </Link>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {formatRelativeTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs pl-6 whitespace-pre-wrap">{c.body}</p>
                </div>
              ))
            ) : (
              <p className="text-center py-3 text-xs text-slate-500 italic">
                Henüz yorum yapılmamış. İlk yorumu sen yap!
              </p>
            )}
          </div>

          {/* Yeni Yorum Formu */}
          <form onSubmit={handleAddComment} className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={isLoggedIn ? "Bir şeyler yaz..." : "Yorum yapmak için giriş yapmalısın..."}
                disabled={submittingComment}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition shrink-0"
              >
                {submittingComment ? "..." : "Gönder"}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                />
                <span>Anonim rumuzla yanıtla</span>
              </label>
              {!isLoggedIn && (
                <button
                  type="button"
                  onClick={() => router.push("/giris")}
                  className="text-rose-400 hover:underline font-bold"
                >
                  Giriş Yap →
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
