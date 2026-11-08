import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell, CARD } from "@/components/auth/ui";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Kayıt Ol | SinopCepte" };

export default function KayitPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className={`${CARD} h-[32rem] animate-pulse`} aria-label="Yükleniyor" />}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
