"use client";

import { useState } from "react";
import Link from "next/link";
import type { CampusNote } from "@/lib/campus";
import { toggleLikeCampusNote, trackDownloadCampusNote, deleteCampusNote } from "@/lib/campus";
import type { AuthUser } from "@/lib/types";

export function CampusCard({
  note,
  currentUser,
  onDeleted,
}: {
  note: CampusNote;
  currentUser?: AuthUser | null;
  onDeleted?: (id: string) => void;
}) {
  const [likes, setLikes] = useState(note.likeCount);
  const [liked, setLiked] = useState(note.likedByMe);
  const [downloads, setDownloads] = useState(note.downloadCount);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner =
    currentUser &&
    currentUser.handle &&
    currentUser.handle.toLowerCase() === note.authorHandle.toLowerCase();
  const isAdmin = currentUser && currentUser.roles?.includes("ADMIN");
  const canDelete = isOwner || isAdmin;

  const handleLike = async () => {
    if (!currentUser) {
      alert("Beğenmek için lütfen giriş yapın.");
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    try {
      const updated = await toggleLikeCampusNote(note.id);
      setLikes(updated.likeCount);
      setLiked(updated.likedByMe);
    } catch {
      // Revert on error
    } finally {
      setIsLiking(false);
    }
  };

  const handleDownload = () => {
    setDownloads((prev) => prev + 1);
    trackDownloadCampusNote(note.id);
    window.open(note.fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async () => {
    if (!confirm(`"${note.title}" ders notunu silmek istediğinize emin misiniz?`)) return;
    setIsDeleting(true);
    try {
      await deleteCampusNote(note.id);
      onDeleted?.(note.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Silme işlemi başarısız.");
      setIsDeleting(false);
    }
  };

  // Sınav türü rengi
  const badgeColor =
    note.examType === "Vize"
      ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40"
      : note.examType === "Final"
        ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40"
        : note.examType === "Büt"
          ? "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40"
          : "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40";

  return (
    <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-white dark:bg-[#0e1224] border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs dark:shadow-none transition space-y-3">
      {/* Üst Kısım: Fakülte, Bölüm & Sınav Türü */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 truncate">
            {note.faculty}
          </span>
          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
            • {note.department}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
            {note.examType}
          </span>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            {note.term}
          </span>
        </div>
      </div>

      {/* Ders Kodu & Başlık */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-mono font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/60 shrink-0">
            {note.courseCode}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">
            {note.courseName}
          </span>
        </div>

        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
          {note.title}
        </h4>

        {note.description && (
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {note.description}
          </p>
        )}
      </div>

      {/* Dosya Bilgisi & İndir Kutusu */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl shrink-0">📄</span>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-mono">
              {note.fileName}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              {note.fileSize} • {downloads} indirme
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-600 dark:hover:bg-cyan-500 font-bold text-xs transition flex items-center gap-1.5 shrink-0 shadow-xs"
        >
          <span>İndir / Aç</span>
          <span>↗</span>
        </button>
      </div>

      {/* Alt Bilgi: Yükleyen & Beğeniler */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={`/u/${note.authorHandle}`}
            className="flex items-center gap-1.5 hover:underline group min-w-0"
            title={`@${note.authorHandle} profilini görüntüle`}
          >
            <span className="text-sm shrink-0">🎓</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
              {note.authorName}
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden xs:inline truncate">
              @{note.authorHandle}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLike}
            disabled={isLiking}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              liked
                ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-transparent"
            }`}
            title={liked ? "Teşekkürü Geri Al" : "Faydalı Buldum / Teşekkür Et"}
          >
            <span>{liked ? "❤️" : "🤍"}</span>
            <span>{likes}</span>
          </button>

          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-slate-400 hover:text-rose-500 text-xs px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Bu ders notunu sil"
            >
              Sil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
