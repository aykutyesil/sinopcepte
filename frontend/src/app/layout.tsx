import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  // Legacy 400–900 istiyordu ama Google Fonts bu ailede en çok 800 sunuyor (ölçüldü: legacy
  // isteğine 400–800 @font-face döndü). `font-black` (900) her iki sürümde de 800 yüzüyle çizilir.
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SinopCepte | Canlı Şehir Rehberi & Dikey Akış Portalı",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Koyu tek tema (parity P13): sınıf sunucuda sabit, istemcide değişmez.
    <html lang="tr" className={`dark ${jakarta.variable}`} suppressHydrationWarning>
      <body className="bg-[#090b14] text-slate-100 font-sans antialiased selection:bg-rose-500 selection:text-white min-h-screen overflow-x-clip w-full max-w-full">
        {children}
      </body>
    </html>
  );
}
