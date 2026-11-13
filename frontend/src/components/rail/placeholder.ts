import type { LoadState } from "@/lib/types";

/** Sağ kolon listeleri için boş/yükleniyor/hata metni. */
export function railListPlaceholder(state: LoadState): string {
  if (state === "loading") return "Yükleniyor...";
  if (state === "error") return "Liste şu an alınamadı.";
  return "Kayıtlı işletme yok.";
}
