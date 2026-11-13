// Sinop Gece İtirafları (PostgreSQL & Backend API Entegre)

export type ConfessionCategory = "gece" | "mekan" | "kampus" | "ask";
export type ReactionType = "FIRE" | "LAUGH" | "SHOCK" | "HEART";

export interface ConfessionComment {
  id: string;
  confessionId: string;
  aliasName: string;
  aliasAvatar: string;
  isAnonymous: boolean;
  authorHandle?: string | null;
  body: string;
  createdAt: string;
  realAuthorHandle?: string | null;
}

export interface Confession {
  id: string;
  aliasName: string;
  aliasAvatar: string;
  venueId?: string | null;
  venueTitle?: string | null;
  category: ConfessionCategory;
  body: string;
  fireCount: number;
  laughCount: number;
  shockCount: number;
  heartCount: number;
  reportCount: number;
  myReactions?: ReactionType[];
  isMine?: boolean;
  hidden?: boolean;
  comments: ConfessionComment[];
  createdAt: string;
  realAuthorHandle?: string | null;
  realAuthorEmail?: string | null;
  realAuthorPhone?: string | null;
}

export const CONFESSION_CATEGORIES: Record<
  ConfessionCategory,
  { label: string; icon: string; badgeClass: string; borderClass: string }
> = {
  gece: {
    label: "Gece Hayatı",
    icon: "🌙",
    badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    borderClass: "border-indigo-500/30",
  },
  mekan: {
    label: "Mekanlar & Kafe",
    icon: "🍸",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    borderClass: "border-amber-500/30",
  },
  kampus: {
    label: "SNÜ Kampüs",
    icon: "🎓",
    badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    borderClass: "border-cyan-500/30",
  },
  ask: {
    label: "Aşk & Flört",
    icon: "💘",
    badgeClass: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    borderClass: "border-rose-500/30",
  },
};

export const CONFESSIONS_UPDATED_EVENT = "sinopcepte:confessions-updated";

let inMemoryConfessions: Confession[] = [];
let isFetchingConfessions = false;

function canFetch(): boolean {
  return typeof window !== "undefined" && !!window.location?.origin && process.env.NODE_ENV !== "test";
}

async function getCsrfToken(): Promise<string | null> {
  if (!canFetch()) return null;
  const prefix = "XSRF-TOKEN=";
  for (const part of (typeof document !== "undefined" ? document.cookie : "").split(";")) {
    const c = part.trim();
    if (c.startsWith(prefix)) return decodeURIComponent(c.slice(prefix.length));
  }
  try {
    await fetch("/api/auth/csrf", { credentials: "same-origin", cache: "no-store" });
    for (const part of document.cookie.split(";")) {
      const c = part.trim();
      if (c.startsWith(prefix)) return decodeURIComponent(c.slice(prefix.length));
    }
  } catch {}
  return null;
}

export function getConfessions(): Confession[] {
  if (inMemoryConfessions.length === 0 && canFetch()) {
    fetchConfessionsFromBackend().catch(() => {});
  }
  return inMemoryConfessions;
}

export function setInMemoryConfessionsForTesting(list: Confession[]): void {
  inMemoryConfessions = list;
}

export async function fetchConfessionsFromBackend(
  sort: "new" | "hot" = "new",
  category?: string,
  venueId?: string
): Promise<Confession[]> {
  if (!canFetch() || isFetchingConfessions) return inMemoryConfessions;
  isFetchingConfessions = true;
  try {
    const params = new URLSearchParams();
    if (sort) params.set("sort", sort);
    if (category && category !== "all") params.set("category", category);
    if (venueId) params.set("venueId", venueId);

    const res = await fetch(`/api/confessions?${params.toString()}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });
    if (res.ok) {
      const data: Confession[] = await res.json();
      inMemoryConfessions = data;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(CONFESSIONS_UPDATED_EVENT));
      }
      return data;
    }
  } catch (err) {
    console.error("fetchConfessionsFromBackend error:", err);
  } finally {
    isFetchingConfessions = false;
  }
  return inMemoryConfessions;
}

export async function createConfession(data: {
  body: string;
  category?: string;
  venueId?: string;
  venueTitle?: string;
  customAliasTheme?: string;
}): Promise<Confession> {
  const trimmed = data.body.trim();
  if (!trimmed) throw new Error("İtiraf metni boş olamaz.");
  if (trimmed.length > 500) throw new Error("İtiraf en fazla 500 karakter olabilir.");

  const csrf = await getCsrfToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (csrf) headers["X-XSRF-TOKEN"] = csrf;

  const res = await fetch("/api/confessions", {
    method: "POST",
    headers,
    credentials: "same-origin",
    body: JSON.stringify({
      body: trimmed,
      category: data.category || "gece",
      venueId: data.venueId || null,
      venueTitle: data.venueTitle || null,
      customAliasTheme: data.customAliasTheme || null,
    }),
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("UNAUTHORIZED");
    }
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || "İtiraf paylaşılamadı.");
  }

  const created: Confession = await res.json();
  inMemoryConfessions = [created, ...inMemoryConfessions.filter((c) => c.id !== created.id)];
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONFESSIONS_UPDATED_EVENT));
  }
  return created;
}

export async function reactConfession(
  id: string,
  type: ReactionType
): Promise<Confession> {
  const csrf = await getCsrfToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (csrf) headers["X-XSRF-TOKEN"] = csrf;

  const res = await fetch(`/api/confessions/${id}/react`, {
    method: "POST",
    headers,
    credentials: "same-origin",
    body: JSON.stringify({ type }),
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error("Tepki verilemedi.");
  }

  const updated: Confession = await res.json();
  inMemoryConfessions = inMemoryConfessions.map((c) => (c.id === updated.id ? updated : c));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONFESSIONS_UPDATED_EVENT));
  }
  return updated;
}

export async function addConfessionComment(
  id: string,
  body: string,
  anonymous: boolean
): Promise<ConfessionComment> {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("Yorum metni boş olamaz.");

  const csrf = await getCsrfToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (csrf) headers["X-XSRF-TOKEN"] = csrf;

  const res = await fetch(`/api/confessions/${id}/comments`, {
    method: "POST",
    headers,
    credentials: "same-origin",
    body: JSON.stringify({ body: trimmed, anonymous }),
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error("Yorum gönderilemedi.");
  }

  const comment: ConfessionComment = await res.json();
  inMemoryConfessions = inMemoryConfessions.map((c) => {
    if (c.id === id) {
      return {
        ...c,
        comments: [...(c.comments || []), comment],
      };
    }
    return c;
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONFESSIONS_UPDATED_EVENT));
  }
  return comment;
}

export async function reportConfession(id: string): Promise<void> {
  const csrf = await getCsrfToken();
  const headers: Record<string, string> = {};
  if (csrf) headers["X-XSRF-TOKEN"] = csrf;

  const res = await fetch(`/api/confessions/${id}/report`, {
    method: "POST",
    headers,
    credentials: "same-origin",
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error("Şikayet iletilemedi.");
  }
}

export async function deleteConfession(id: string): Promise<void> {
  const csrf = await getCsrfToken();
  const headers: Record<string, string> = {};
  if (csrf) headers["X-XSRF-TOKEN"] = csrf;

  const res = await fetch(`/api/confessions/${id}`, {
    method: "DELETE",
    headers,
    credentials: "same-origin",
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error("İtiraf silinemedi.");
  }

  inMemoryConfessions = inMemoryConfessions.filter((c) => c.id !== id);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONFESSIONS_UPDATED_EVENT));
  }
}

export async function fetchAdminConfessions(): Promise<Confession[]> {
  const res = await fetch("/api/admin/confessions", {
    cache: "no-store",
    headers: { Accept: "application/json" },
    credentials: "same-origin",
  });
  if (!res.ok) {
    throw new Error("Admin itirafları yüklenemedi.");
  }
  return res.json();
}

export async function adminToggleHideConfession(id: string): Promise<Confession> {
  const csrf = await getCsrfToken();
  const headers: Record<string, string> = {};
  if (csrf) headers["X-XSRF-TOKEN"] = csrf;

  const res = await fetch(`/api/admin/confessions/${id}/toggle-hide`, {
    method: "POST",
    headers,
    credentials: "same-origin",
  });

  if (!res.ok) {
    throw new Error("Gizleme durumu güncellenemedi.");
  }

  const updated: Confession = await res.json();
  inMemoryConfessions = inMemoryConfessions.map((c) => (c.id === updated.id ? updated : c));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONFESSIONS_UPDATED_EVENT));
  }
  return updated;
}

export async function adminDeleteConfession(id: string): Promise<void> {
  const csrf = await getCsrfToken();
  const headers: Record<string, string> = {};
  if (csrf) headers["X-XSRF-TOKEN"] = csrf;

  const res = await fetch(`/api/admin/confessions/${id}`, {
    method: "DELETE",
    headers,
    credentials: "same-origin",
  });

  if (!res.ok) {
    throw new Error("İtiraf silinemedi.");
  }

  inMemoryConfessions = inMemoryConfessions.filter((c) => c.id !== id);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONFESSIONS_UPDATED_EVENT));
  }
}
