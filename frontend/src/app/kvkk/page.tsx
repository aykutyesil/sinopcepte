import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell, CARD } from "@/components/auth/ui";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni (Taslak) | SinopCepte",
  robots: { index: false },
};

// TASLAK yer tutucu (graph.md N7: gerçek metin hukukçudan gelecek). Burada hukuki metin UYDURULMAZ.
export default function KvkkPage() {
  return (
    <AuthShell wide>
      <div className={`${CARD} space-y-4`}>
        <span className="inline-block text-[11px] font-mono font-black tracking-widest px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/40">
          TASLAK
        </span>
        <h1 className="text-xl font-black text-white font-display">KVKK Aydınlatma Metni</h1>
        <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
          <p>
            Bu sayfa bir <strong className="text-amber-300">yer tutucudur</strong>. 6698 sayılı Kişisel Verilerin
            Korunması Kanunu kapsamındaki aydınlatma metni henüz hazırlanmadı ve buraya eklenecek.
          </p>
          <p className="text-slate-400">
            Metin yayımlandığında bu sayfa güncellenecek ve sürüm bilgisi burada yer alacak.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/kayit" className="text-xs font-bold text-rose-400 hover:text-rose-300">
            ← Kayıt sayfasına dön
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
