// Sinop 2. El ve Öğrenci Paylaşım Pazarı (Marketplace)
// Üniversite ders notları, ev eşyaları, bisiklet, elektronik ve ilanlar

export type MarketplaceCategory =
  | "all"
  | "ders_notu"
  | "elektronik"
  | "ev_esya"
  | "kitap"
  | "arac_bisiklet"
  | "diger";

export type ItemCondition = "sifir" | "yeni_gibi" | "iyi" | "makul";

export interface MarketplaceItem {
  id: string;
  title: string;
  category: Exclude<MarketplaceCategory, "all">;
  price: number; // 0 ise "Ücretsiz / Paylaşım"
  description: string;
  location: string;
  sellerHandle: string;
  sellerName: string;
  sellerAvatar: string;
  phone: string;
  wa: string;
  photos: string[];
  condition: ItemCondition;
  status: "active" | "sold";
  createdAt: string;
}

export const MARKETPLACE_CATEGORIES: Record<
  Exclude<MarketplaceCategory, "all">,
  { label: string; icon: string; badgeClass: string }
> = {
  ders_notu: {
    label: "Ders Notu & Sınav",
    icon: "📚",
    badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  },
  elektronik: {
    label: "Elektronik & Bilgisayar",
    icon: "💻",
    badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  },
  ev_esya: {
    label: "Öğrenci Evi & Eşya",
    icon: "🛋️",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  arac_bisiklet: {
    label: "Bisiklet & Ulaşım",
    icon: "🚲",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  kitap: {
    label: "Kitap & Kaynak",
    icon: "📖",
    badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  },
  diger: {
    label: "Diğer İlanlar",
    icon: "📦",
    badgeClass: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  },
};

export const CONDITION_LABELS: Record<ItemCondition, { label: string; color: string }> = {
  sifir: { label: "Sıfır / Kapalı Kutu", color: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30" },
  yeni_gibi: { label: "Yeni Gibi / Çok Az Kullanılmış", color: "text-cyan-400 bg-cyan-950/60 border-cyan-500/30" },
  iyi: { label: "İyi Durumda / Sorunsuz", color: "text-blue-400 bg-blue-950/60 border-blue-500/30" },
  makul: { label: "Kullanılabilir / Öğrenci İşi", color: "text-amber-400 bg-amber-950/60 border-amber-500/30" },
};

export const SEED_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: "mkt-1",
    title: "SNÜ Bilgisayar Müh. 2. Sınıf Algoritmalar & Veri Yapıları Vize/Final Özet Notları",
    category: "ders_notu",
    price: 0,
    description: "Tüm vize ve final çıkmış soru çözümleri, hoca tüyo notları ve el yazısı renkli PDF çıktısı. İhtiyacı olan öğrenci arkadaşa ücretsiz devir.",
    location: "Sinop Üniversitesi Mühendislik Fakültesi",
    sellerHandle: "zeynep_snu",
    sellerName: "Zeynep",
    sellerAvatar: "yelkenli",
    phone: "05325713457",
    wa: "905325713457",
    photos: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"],
    condition: "yeni_gibi",
    status: "active",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 dk önce
  },
  {
    id: "mkt-2",
    title: "Bisan 21 Vites Dağ Bisikleti (Kordon & Karakum için bakımlı)",
    category: "arac_bisiklet",
    price: 2800,
    description: "Vites ve fren telleri yeni değişti, dış lastikler iyi durumda. Kordon ve Karakum sahil yolu turları için idealdir. Kilit ve ön far hediye.",
    location: "Merkez / İskele",
    sellerHandle: "berk",
    sellerName: "Berk",
    sellerAvatar: "marti",
    phone: "05445721905",
    wa: "905445721905",
    photos: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80"],
    condition: "iyi",
    status: "active",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 saat önce
  },
  {
    id: "mkt-3",
    title: "Uğur A+ Mini Buzdolabı (Öğrenci evinden, tertemiz)",
    category: "ev_esya",
    price: 3200,
    description: "Mezuniyet nedeniyle evimizi boşaltıyoruz. Buzluğu ve genel soğutması canavar gibi, sessiz çalışır. Nakliyede yardımcı olunur.",
    location: "Kefevi Mahallesi",
    sellerHandle: "bugra",
    sellerName: "Buğra",
    sellerAvatar: "kale",
    phone: "05417894561",
    wa: "905417894561",
    photos: ["https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80"],
    condition: "iyi",
    status: "active",
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 saat önce
  },
  {
    id: "mkt-4",
    title: "Anker Soundcore Q30 Aktif Gürültü Engelleyici Kulaklık",
    category: "elektronik",
    price: 1650,
    description: "Kütüphanede ders çalışırken ANC (gürültü engelleme) inanılmaz işe yarıyor. Kutusu, taşıma çantası ve aux kablosu tam.",
    location: "Sinop Üniversitesi Merkez Kütüphane",
    sellerHandle: "kaan_rock",
    sellerName: "Kaan",
    sellerAvatar: "fener",
    phone: "05331234567",
    wa: "905331234567",
    photos: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"],
    condition: "yeni_gibi",
    status: "active",
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: "mkt-5",
    title: "Ahşap Çalışma Masası + Fileli Ergonomik Döner Sandalye",
    category: "ev_esya",
    price: 1400,
    description: "Öğrenci odası için ideal ölçülerde (120x60). Kırık veya sallantı yoktur. İkisi takım olarak verilecektir.",
    location: "Bostancılı / Kampüs Yolu",
    sellerHandle: "selin_snu",
    sellerName: "Selin",
    sellerAvatar: "denizkabugu",
    phone: "05353456789",
    wa: "905353456789",
    photos: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80"],
    condition: "iyi",
    status: "active",
    createdAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
  },
  {
    id: "mkt-6",
    title: "SNÜ Eğitim Fakültesi Pedagojik Formasyon Ders Kitapları Seti",
    category: "kitap",
    price: 250,
    description: "6 adet güncel müfredat kitabı. Sayfaları temiz, altı sadece kurşun kalemle çizili. KPSS Eğitim Bilimleri hazırlık için de uygun.",
    location: "Zeytinlik Mahallesi",
    sellerHandle: "melis_57",
    sellerName: "Melis",
    sellerAvatar: "marti",
    phone: "05451239876",
    wa: "905451239876",
    photos: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80"],
    condition: "iyi",
    status: "active",
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
  },
];

const STORAGE_KEY = "sinopcepte_marketplace_items";
export const MARKETPLACE_UPDATED_EVENT = "sinopcepte:marketplace-updated";

function notifyUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(MARKETPLACE_UPDATED_EVENT));
  }
}

export function getMarketplaceItems(): MarketplaceItem[] {
  if (typeof window === "undefined") {
    return SEED_MARKETPLACE_ITEMS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_MARKETPLACE_ITEMS));
      return SEED_MARKETPLACE_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_MARKETPLACE_ITEMS;
  } catch {
    return SEED_MARKETPLACE_ITEMS;
  }
}

export function createMarketplaceItem(
  item: Omit<MarketplaceItem, "id" | "status" | "createdAt">
): MarketplaceItem {
  const current = getMarketplaceItems();
  const newItem: MarketplaceItem = {
    ...item,
    id: "mkt-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    status: "active",
    createdAt: new Date().toISOString(),
  };

  const updated = [newItem, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyUpdate();
  }
  return newItem;
}

export function deleteMarketplaceItem(id: string): boolean {
  const current = getMarketplaceItems();
  const updated = current.filter((i) => i.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyUpdate();
  }
  return updated.length < current.length;
}

export function markItemAsSold(id: string): boolean {
  const current = getMarketplaceItems();
  let found = false;
  const updated = current.map((i) => {
    if (i.id === id) {
      found = true;
      return { ...i, status: (i.status === "sold" ? "active" : "sold") as "active" | "sold" };
    }
    return i;
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyUpdate();
  }
  return found;
}

export function filterMarketplaceItems(
  items: readonly MarketplaceItem[],
  filters: {
    category?: MarketplaceCategory;
    query?: string;
  }
): MarketplaceItem[] {
  return items.filter((item) => {
    if (filters.category && filters.category !== "all" && item.category !== filters.category) {
      return false;
    }
    if (filters.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      const matchSeller = item.sellerHandle.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc && !matchSeller) {
        return false;
      }
    }
    return true;
  });
}
