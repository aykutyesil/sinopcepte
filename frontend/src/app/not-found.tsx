import Link from "next/link";
import { AuthShell, CARD } from "@/components/auth/ui";

export default function NotFound() {
  return (
    <AuthShell>
      <div className={`${CARD} text-center space-y-3`}>
        <p className="text-4xl" aria-hidden="true">
          🧭
        </p>
        <h1 className="text-xl font-black text-white font-display">Sayfa bulunamadı</h1>
        <p className="text-sm text-slate-400">Aradığın sayfa ya da kullanıcı mevcut değil, silinmiş olabilir.</p>
        <Link href="/" className="inline-block text-xs font-bold px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition">
          Akışa dön
        </Link>
      </div>
    </AuthShell>
  );
}
