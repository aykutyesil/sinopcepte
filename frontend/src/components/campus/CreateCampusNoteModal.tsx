"use client";

import { useState } from "react";
import { SNU_FACULTIES, EXAM_TYPES, createCampusNote, type CampusNote } from "@/lib/campus";
import type { AuthUser } from "@/lib/types";

export function CreateCampusNoteModal({
  isOpen,
  onClose,
  currentUser,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AuthUser | null;
  onCreated?: (note: CampusNote) => void;
}) {
  const [faculty, setFaculty] = useState(SNU_FACULTIES[0].name);
  const [department, setDepartment] = useState(SNU_FACULTIES[0].departments[0]);
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [term, setTerm] = useState("Güz");
  const [examType, setExamType] = useState("Vize");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("2.5 MB");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const currentFacultyObj = SNU_FACULTIES.find((f) => f.name === faculty) || SNU_FACULTIES[0];

  const handleFacultyChange = (newFac: string) => {
    setFaculty(newFac);
    const obj = SNU_FACULTIES.find((f) => f.name === newFac);
    if (obj && obj.departments.length > 0) {
      setDepartment(obj.departments[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Lütfen önce giriş yapın.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const created = await createCampusNote({
        faculty,
        department,
        courseCode,
        courseName,
        term,
        examType,
        title,
        description,
        fileUrl: fileUrl.trim() || "https://drive.google.com",
        fileName: fileName.trim() || `${courseCode.toUpperCase()}_Not.pdf`,
        fileSize: fileSize.trim() || "2.1 MB",
      });

      onCreated?.(created);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ders notu paylaşılamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0b0e1e] border border-slate-200 dark:border-cyan-500/30 text-slate-900 dark:text-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapat butonu */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition"
        >
          ✕
        </button>

        <div className="mb-4 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎓</span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-display">
              Ders Notu / Çıkmış Soru Paylaş
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sinop Üniversitesi öğrencileriyle çıkmış sınav soruları veya ders özetlerini paylaş.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Fakülte & Bölüm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fakülte / Yüksekokul
              </label>
              <select
                value={faculty}
                onChange={(e) => handleFacultyChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                {SNU_FACULTIES.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bölüm
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                {currentFacultyObj.departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ders Kodu & Ders Adı */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ders Kodu *
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                placeholder="Örn: BLM101"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dersin Tam Adı *
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Örn: Algoritmalar ve Programlama I"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          {/* Dönem & Sınav Türü */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dönem
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Güz">Güz Dönemi</option>
                <option value="Bahar">Bahar Dönemi</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Materyal / Sınav Türü
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                {EXAM_TYPES.filter((t) => t.key !== "all").map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Not Başlığı */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Başlık *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: 2024 Vize Çıkmış Soruları & El Yazısı Çözümleri"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Açıklama / İpuçları (İsteğe Bağlı)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hangi hocanın dersi, hangi konular ağırlıklı vs..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Dosya İndirme Linki (Drive / Dropbox) & Dosya Adı */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                İndirme Linki (Google Drive / Bulut) *
              </label>
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dosya Adı &amp; Boyut
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Vize_Notlari.pdf"
                  className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="2.5 MB"
                  className="w-20 shrink-0 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-600 dark:hover:bg-cyan-500 font-bold text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50"
            >
              {loading ? "Paylaşılıyor..." : "🎓 Notu / Soruyu Paylaş"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
