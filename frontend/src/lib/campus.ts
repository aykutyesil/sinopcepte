import { backendUrl } from "./server-api";

export interface CampusNote {
  id: string;
  authorHandle: string;
  authorName: string;
  authorAvatar: string;
  faculty: string;
  department: string;
  courseCode: string;
  courseName: string;
  term: string;
  examType: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  likeCount: number;
  downloadCount: number;
  likedByMe: boolean;
  createdAt: string;
}

export interface CreateCampusNotePayload {
  faculty: string;
  department: string;
  courseCode: string;
  courseName: string;
  term: string;
  examType: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: string;
}

export const SNU_FACULTIES: { name: string; departments: string[] }[] = [
  {
    name: "Mühendislik ve Mimarlık Fakültesi",
    departments: [
      "Bilgisayar Mühendisliği",
      "Nükleer Enerji Mühendisliği",
      "İnşaat Mühendisliği",
      "Çevre Mühendisliği",
    ],
  },
  {
    name: "Eğitim Fakültesi",
    departments: [
      "Sınıf Öğretmenliği",
      "İlköğretim Matematik Öğretmenliği",
      "Türkçe Öğretmenliği",
      "Okul Öncesi Öğretmenliği",
      "Rehberlik ve Psikolojik Danışmanlık (PDR)",
      "Fen Bilgisi Öğretmenliği",
    ],
  },
  {
    name: "Fen-Edebiyat Fakültesi",
    departments: [
      "Tarih",
      "Türk Dili ve Edebiyatı",
      "Matematik",
      "Biyoloji",
      "Sosyoloji",
      "İstatistik",
    ],
  },
  {
    name: "Sağlık Bilimleri Fakültesi",
    departments: [
      "Hemşirelik",
      "Ebelik",
      "Sağlık Yönetimi",
      "Fizyoterapi ve Rehabilitasyon",
    ],
  },
  {
    name: "İlahiyat Fakültesi",
    departments: ["İlahiyat"],
  },
  {
    name: "Su Ürünleri Fakültesi",
    departments: ["Su Ürünleri Mühendisliği"],
  },
  {
    name: "Spor Bilimleri Fakültesi",
    departments: ["Beden Eğitimi ve Spor", "Antrenörlük"],
  },
  {
    name: "Meslek Yüksekokulları",
    departments: [
      "Sinop MYO",
      "Gerze MYO",
      "Ayancık MYO",
      "Boyabat İİBF & MYO",
    ],
  },
];

export const EXAM_TYPES = [
  { key: "all", label: "Tüm Materyaller" },
  { key: "Vize", label: "Vize Soruları" },
  { key: "Final", label: "Final Soruları" },
  { key: "Büt", label: "Bütünleme" },
  { key: "Ders Notu", label: "Ders Notu / Özet" },
];

export async function fetchCampusNotes(params?: {
  faculty?: string;
  department?: string;
  examType?: string;
  q?: string;
}): Promise<CampusNote[]> {
  const query = new URLSearchParams();
  if (params?.faculty) query.set("faculty", params.faculty);
  if (params?.department) query.set("department", params.department);
  if (params?.examType && params.examType !== "all") query.set("examType", params.examType);
  if (params?.q) query.set("q", params.q);

  const res = await fetch(`/api/campus/notes?${query.toString()}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Ders notları alınamadı: ${res.status}`);
  }

  return (await res.json()) as CampusNote[];
}

export async function createCampusNote(payload: CreateCampusNotePayload): Promise<CampusNote> {
  const res = await fetch("/api/campus/notes", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Ders notu paylaşılamadı");
  }

  return (await res.json()) as CampusNote;
}

export async function toggleLikeCampusNote(id: string): Promise<CampusNote> {
  const res = await fetch(`/api/campus/notes/${id}/like`, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error("Beğeni işlemi başarısız");
  }

  return (await res.json()) as CampusNote;
}

export async function trackDownloadCampusNote(id: string): Promise<void> {
  try {
    await fetch(`/api/campus/notes/${id}/download`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Analytics failure should not block download
  }
}

export async function deleteCampusNote(id: string): Promise<void> {
  const res = await fetch(`/api/campus/notes/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Ders notu silinemedi");
  }
}
