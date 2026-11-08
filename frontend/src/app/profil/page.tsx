import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/ui";
import { ProfileEditor } from "@/components/profile/ProfileEditor";

export const metadata: Metadata = { title: "Profilim | SinopCepte", robots: { index: false } };

// Oturum HttpOnly çerezde; profil istemcide `/api/me/profile` ile çekilir.
// 401 → `/giris?next=/profil`. Kabuk statik prerender edilir.
export default function ProfilPage() {
  return (
    <AuthShell wide>
      <ProfileEditor />
    </AuthShell>
  );
}
