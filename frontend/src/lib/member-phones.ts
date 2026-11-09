// SinopCepte Üye Rehberi & Telefon Eşleştirmeleri

export interface MemberContact {
  phone: string;
  wa: string;
  name: string;
}

export const MEMBER_DIRECTORY: Record<string, MemberContact> = {
  aykut: { phone: "0544 572 19 05", wa: "905445721905", name: "Aykut Yeşil" },
  burkay: { phone: "0532 571 34 57", wa: "905325713457", name: "Burkay Bahadır" },
  serhat_snk: { phone: "0532 578 11 22", wa: "905325781122", name: "Serhat K." },
  deniz_57: { phone: "0542 570 65 43", wa: "905425706543", name: "Deniz Y." },
  zeynep_snu: { phone: "0533 571 33 44", wa: "905335713344", name: "Zeynep (SNÜ)" },
  kaan_rock: { phone: "0555 572 33 22", wa: "905555723322", name: "Kaan M." },
  eren_k: { phone: "0533 573 88 57", wa: "905335738857", name: "Eren Kaya" },
  melis_t: { phone: "0542 574 22 57", wa: "905425742257", name: "Melis Tan" },
  merve_art: { phone: "0530 573 11 22", wa: "905305731122", name: "Merve" },
  ahmet_57: { phone: "0544 579 22 33", wa: "905445792233", name: "Ahmet" },
  oskibash: { phone: "0535 577 89 12", wa: "905355778912", name: "Oğuzhan" },
};

export function getMemberPhone(handle: string | null | undefined): string {
  if (!handle) return "";
  const clean = handle.toLowerCase().replace(/^@/, "");
  return MEMBER_DIRECTORY[clean]?.phone || "";
}

export function getMemberWa(handle: string | null | undefined): string {
  if (!handle) return "";
  const clean = handle.toLowerCase().replace(/^@/, "");
  return MEMBER_DIRECTORY[clean]?.wa || "";
}
