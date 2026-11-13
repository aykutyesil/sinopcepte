// Avatar anahtarı → emoji (graph.md "N7 ayrıntısı"). Dosya yükleme yok; sabit liste.
// Backend aynı anahtar kümesini doğrular; burada yalnız gösterim için kullanılır.

export const AVATARS = [
  { key: "marti", emoji: "🕊️", label: "Martı" },
  { key: "hamsi", emoji: "🐟", label: "Hamsi" },
  { key: "fener", emoji: "🗼", label: "Fener" },
  { key: "kale", emoji: "🏰", label: "Kale" },
  { key: "dalga", emoji: "🌊", label: "Dalga" },
  { key: "capa", emoji: "⚓", label: "Çapa" },
  { key: "balik", emoji: "🐠", label: "Balık" },
  { key: "yildiz", emoji: "⭐", label: "Yıldız" },
  { key: "gunes", emoji: "☀️", label: "Güneş" },
  { key: "ay", emoji: "🌙", label: "Ay" },
  { key: "kedi", emoji: "🐱", label: "Kedi" },
  { key: "yunus", emoji: "🐬", label: "Yunus" },
] as const;

export type AvatarKey = (typeof AVATARS)[number]["key"];

export const DEFAULT_AVATAR: AvatarKey = "marti";

export function isAvatarKey(key: unknown): key is AvatarKey {
  return typeof key === "string" && AVATARS.some((a) => a.key === key);
}

/** Bilinmeyen / boş anahtar varsayılan avatara (martı) düşer. */
export function avatarEmoji(key: string | null | undefined): string {
  const found = AVATARS.find((a) => a.key === key);
  return (found ?? AVATARS[0]).emoji;
}
