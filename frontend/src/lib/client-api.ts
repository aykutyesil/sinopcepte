// Tarayıcı tarafı API çağrıları: aynı köken (`/api/*` Next.js rewrite ile backend'e gider).
// Oturum HttpOnly çerezde; CSRF için Spring'in `XSRF-TOKEN` çerezi her yazmadan önce TAZE okunur
// (giriş/çıkış token'ı döndürür) ve `X-XSRF-TOKEN` başlığında gönderilir.

import { parseRetryAfter } from "./api-errors";
import type { AuthUser, Item, LiveEvent, OwnProfile, ProfileUpdate } from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    /** Hata yanıtının JSON gövdesi (okunamazsa `null`). */
    public body: unknown = null,
    /** 429 için `Retry-After` (saniye), yoksa `null`. */
    public retryAfter: number | null = null,
  ) {
    super(message);
  }
}

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = name + "=";
  for (const part of document.cookie.split(";")) {
    const c = part.trim();
    if (c.startsWith(prefix)) return decodeURIComponent(c.slice(prefix.length));
  }
  return null;
}

async function ensureCsrfToken(): Promise<string | null> {
  let token = readCookie("XSRF-TOKEN");
  if (!token) {
    await fetch("/api/auth/csrf", { credentials: "same-origin", cache: "no-store" });
    token = readCookie("XSRF-TOKEN");
  }
  return token;
}

async function write(method: "POST" | "PUT" | "DELETE", path: string, body?: unknown): Promise<Response> {
  const token = await ensureCsrfToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["X-XSRF-TOKEN"] = token;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(path, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw await toApiError(res, `${method} ${path}`);
  return res;
}

async function toApiError(res: Response, what: string): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // Gövde yok ya da JSON değil.
  }
  return new ApiError(res.status, `${what} -> ${res.status}`, body, parseRetryAfter(res.headers.get("Retry-After"), Date.now()));
}

async function readJson(path: string): Promise<Response> {
  const res = await fetch(path, { credentials: "same-origin", cache: "no-store", headers: { Accept: "application/json" } });
  if (!res.ok) throw await toApiError(res, `GET ${path}`);
  return res;
}

export function isAdmin(user: AuthUser | null): boolean {
  return !!user && Array.isArray(user.roles) && user.roles.some((r) => r === "ADMIN" || r === "ROLE_ADMIN");
}

export async function fetchMe(): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as AuthUser;
  } catch {
    return null;
  }
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await write("POST", "/api/auth/login", { username, password });
  return (await res.json()) as AuthUser;
}

export async function logout(): Promise<void> {
  await write("POST", "/api/auth/logout");
}

export interface RegisterRequest {
  handle: string;
  email: string;
  password: string;
  kvkkAccepted: boolean;
}

/** 201 `Me`, oturum açılmış olarak. Backend JSESSIONID ve XSRF-TOKEN'ı yeniler. */
export async function register(req: RegisterRequest): Promise<AuthUser> {
  const res = await write("POST", "/api/auth/register", req);
  return (await res.json()) as AuthUser;
}

export async function fetchOwnProfile(): Promise<OwnProfile> {
  const res = await readJson("/api/me/profile");
  return (await res.json()) as OwnProfile;
}

export async function updateOwnProfile(update: ProfileUpdate): Promise<OwnProfile> {
  const res = await write("PUT", "/api/me/profile", update);
  return (await res.json()) as OwnProfile;
}

/** 204. Yanlış mevcut şifre → 401 (`errors[0].field = currentPassword`), oturum düşmüş sayılmaz. */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await write("PUT", "/api/me/password", { currentPassword, newPassword });
}

/** 204, oturum kapanır. ADMIN → 403. */
export async function deleteAccount(password: string): Promise<void> {
  await write("DELETE", "/api/me", { password });
}

export type NewItem = Omit<Item, "id"> & { id?: string };
export type NewEvent = Omit<LiveEvent, "id"> & { id?: string };

export async function createItem(item: NewItem): Promise<void> {
  await write("POST", "/api/admin/items", item);
}

export async function createEvent(ev: NewEvent): Promise<void> {
  await write("POST", "/api/admin/events", ev);
}

export async function deleteItem(id: string): Promise<void> {
  await write("DELETE", `/api/admin/items/${encodeURIComponent(id)}`);
}

export async function deleteEvent(id: string): Promise<void> {
  await write("DELETE", `/api/admin/events/${encodeURIComponent(id)}`);
}
