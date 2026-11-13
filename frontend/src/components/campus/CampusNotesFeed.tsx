"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  SNU_FACULTIES,
  EXAM_TYPES,
  fetchCampusNotes,
  type CampusNote,
} from "@/lib/campus";
import { CampusCard } from "./CampusCard";
import { CreateCampusNoteModal } from "./CreateCampusNoteModal";
import type { AuthUser } from "@/lib/types";

export function CampusNotesFeed({ me }: { me?: AuthUser | null }) {
  const [notes, setNotes] = useState<CampusNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedExamType, setSelectedExamType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetchCampusNotes({
      faculty: selectedFaculty !== "all" ? selectedFaculty : undefined,
      department: selectedDepartment !== "all" ? selectedDepartment : undefined,
      examType: selectedExamType !== "all" ? selectedExamType : undefined,
      q: search.trim() ? search.trim() : undefined,
    })
      .then((data) => setNotes(data))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedFaculty, selectedDepartment, selectedExamType]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const activeFacultyObj = SNU_FACULTIES.find((f) => f.name === selectedFaculty);
  const departmentOptions = activeFacultyObj ? activeFacultyObj.departments : [];

  const handleFacultyChange = (f: string) => {
    setSelectedFaculty(f);
    setSelectedDepartment("all");
  };

  const handleNoteCreated = (newNote: CampusNote) => {
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleNoteDeleted = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* 🎓 Kampüs Karşılama & Paylaş Bannerı */}
      <section className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎓</span>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
                SNÜ Kampüs &amp; Sınav Notları
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Sinop Üniversitesi fakülte ve bölümlerine ait çıkmış vize-final soruları, çözümler ve ders özetleri.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!me) {
                alert("Ders notu paylaşmak için lütfen giriş yapın.");
                return;
              }
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-rose-600 dark:hover:bg-rose-500 font-bold text-xs transition flex items-center justify-center gap-1.5 shrink-0 shadow-xs active:scale-98"
          >
            <span>➕ Not / Soru Paylaş</span>
          </button>
        </div>
      </section>

      {/* 🔍 Filtreler: Fakülte, Bölüm & Arama */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-none space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Fakülte Seçimi */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mb-1">
              Fakülte Seç
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => handleFacultyChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Tüm Fakülteler ({SNU_FACULTIES.length})</option>
              {SNU_FACULTIES.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bölüm Seçimi */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mb-1">
              Bölüm Seç
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              disabled={selectedFaculty === "all"}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            >
              <option value="all">Tüm Bölümler</option>
              {departmentOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sınav Türü Çipleri */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {EXAM_TYPES.map((t) => {
            const isSelected = selectedExamType === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setSelectedExamType(t.key)}
                className={`transition shrink-0 text-xs px-3 py-1 rounded-lg ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Ders Kodu / Başlık Arama */}
        <div className="relative pt-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ders kodu veya not ara... (örn: BLM101, Veri Yapıları, Osmanlı)"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Akış / Ders Notları Listesi */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-white dark:bg-[#0c0f17] rounded-2xl border border-slate-200 dark:border-slate-800">
            Ders notları yükleniyor...
          </div>
        ) : notes.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-slate-800 text-center space-y-2.5">
            <span className="text-3xl block">📚</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Aradığınız kriterde ders notu veya sınav sorusu bulunamadı
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Farklı bir fakülte seçmeyi deneyin veya bu ders için ilk notu siz paylaşın!
            </p>
            <button
              type="button"
              onClick={() => {
                if (!me) {
                  alert("Lütfen önce giriş yapın.");
                  return;
                }
                setModalOpen(true);
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              İlk Notu Sen Paylaş
            </button>
          </div>
        ) : (
          notes.map((note) => (
            <CampusCard
              key={note.id}
              note={note}
              currentUser={me}
              onDeleted={handleNoteDeleted}
            />
          ))
        )}
      </div>

      {/* Paylaş Modalı */}
      <CreateCampusNoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentUser={me}
        onCreated={handleNoteCreated}
      />
    </div>
  );
}
