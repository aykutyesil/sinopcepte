import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell, CARD } from "@/components/auth/ui";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Giriş Yap | SinopCepte" };

// `useSearchParams` (`?next=`) istemcide okunur; Suspense olmadan üretim derlemesi başarısız olur.
export default function GirisPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className={`${CARD} h-80 animate-pulse`} aria-label="Yükleniyor" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
