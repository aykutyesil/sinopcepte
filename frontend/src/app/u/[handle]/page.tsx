import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AuthShell, CARD } from "@/components/auth/ui";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import { loadPublicProfile } from "@/lib/server-api";
import { normalizeHandle, validateHandle } from "@/lib/validation";

export const metadata: Metadata = { title: "Profil | SinopCepte" };

// Parametre çalışma anı verisidir (generateStaticParams yok) → erişim Suspense içinde.
export default function PublicProfilePage({ params }: PageProps<"/u/[handle]">) {
  return (
    <AuthShell wide>
      <Suspense fallback={<ProfileSkeleton />}>
        {params.then(({ handle }) => (
          <PublicProfileContent raw={handle} />
        ))}
      </Suspense>
    </AuthShell>
  );
}

async function PublicProfileContent({ raw }: { raw: string }) {
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    notFound();
  }
  const handle = normalizeHandle(decoded);
  // Geçersiz ve ayrılmış rumuzlar (ör. admin; backend de ADMIN için 404 döner) backend'e gitmez.
  if (validateHandle(handle)) notFound();

  const result = await loadPublicProfile(handle);
  if (result.kind === "not-found") notFound();
  if (result.kind === "error") {
    return (
      <div className={`${CARD} text-center space-y-2`}>
        <p className="text-sm text-slate-200 font-bold">Profil şu an yüklenemedi.</p>
        <p className="text-xs text-slate-400">Sunucuya ulaşılamıyor olabilir. Biraz sonra tekrar deneyin.</p>
      </div>
    );
  }
  return <PublicProfileCard profile={result.profile} />;
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4" aria-label="Profil yükleniyor">
      <div className={`${CARD} h-64 animate-pulse`} />
      <div className={`${CARD} h-24 animate-pulse`} />
    </div>
  );
}
