// SinopCepte Telefon ve İletişim Yardımcıları

export function formatPhoneNumber(val: string | null | undefined): string {
  if (!val) return "";
  const cleaned = val.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
  }
  if (cleaned.length === 10) {
    return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  }
  return val;
}

export function formatWaNumber(val: string | null | undefined): string {
  if (!val) return "";
  const cleaned = val.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "9" + cleaned;
  if (!cleaned.startsWith("90") && cleaned.length === 10) return "90" + cleaned;
  return cleaned;
}

export function getMemberPhone(_handle: string | null | undefined): string {
  return "";
}

export function getMemberWa(_handle: string | null | undefined): string {
  return "";
}
