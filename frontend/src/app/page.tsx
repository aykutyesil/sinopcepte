import { Suspense } from "react";
import { Portal } from "@/components/Portal";
import { loadPortalData } from "@/lib/server-api";

// Veri istek anında backend'den çekilir (önbellek yok). Derleme sırasında yalnız
// Suspense yedeği (sayfa iskeleti + "yükleniyor") prerender edilir.
async function PortalWithData() {
  const data = await loadPortalData();
  return <Portal data={data} />;
}

export default function Home() {
  return (
    <Suspense fallback={<Portal data={null} />}>
      <PortalWithData />
    </Suspense>
  );
}
