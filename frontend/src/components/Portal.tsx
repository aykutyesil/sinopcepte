"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildFeed } from "@/lib/feed";
import { fetchMe, isAdmin as hasAdminRole, logout } from "@/lib/client-api";
import type { FeedFilter, PortalData } from "@/lib/types";
import { useWeather } from "@/hooks/useWeather";
import { Dock } from "./Dock";
import { FeedHeader } from "./FeedHeader";
import { FeedStream } from "./FeedStream";
import { RightRail } from "./rail/RightRail";
import { AdminFloatingBar } from "./admin/AdminFloatingBar";
import { AdminLoginModal } from "./admin/AdminLoginModal";
import { AdminPanelModal } from "./admin/AdminPanelModal";

/** `data === null` → sunucu verisi henüz gelmedi (Suspense yedeği / iskelet). */
export function Portal({ data }: { data: PortalData | null }) {
  const router = useRouter();
  const weather = useWeather();

  const [filter, setFilter] = useState<FeedFilter>("all");
  const [query, setQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const loading = data === null;
  // Props'tan türet (state'e kopyalama yok) → router.refresh() sonrası akış güncellenir.
  const items = useMemo(() => data?.items ?? [], [data]);
  const events = useMemo(() => data?.events ?? [], [data]);
  const backendError = !loading && (data.items === null || data.events === null);

  const feed = useMemo(() => buildFeed({ events, items, filter, query }), [events, items, filter, query]);

  // Oturum çerezi varsa admin durumunu backend'den al (legacy: sessionStorage bayrağı).
  useEffect(() => {
    if (loading) return;
    let alive = true;
    fetchMe().then((u) => {
      if (alive) setIsAdmin(hasAdminRole(u));
    });
    return () => {
      alive = false;
    };
  }, [loading]);

  const handleFilter = (f: FeedFilter) => {
    // Legacy filtre tıklaması arama sonucunu bırakıp filtre görünümünü çizer ama kutudaki
    // metni silmez; burada görünenle kutu tutarlı olsun diye arama da temizlenir.
    setFilter(f);
    setQuery("");
  };

  const openAdmin = () => {
    if (loading) return;
    if (isAdmin) setPanelOpen(true);
    else setLoginOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Oturum zaten düşmüş olabilir; arayüz yine de çıkış durumuna geçer.
    }
    setIsAdmin(false);
    setPanelOpen(false);
    alert("Yönetici çıkışı yapıldı.");
  };

  return (
    <>
      <div className="max-w-7xl mx-auto flex min-h-screen w-full overflow-x-hidden">
        <Dock filter={filter} onFilter={handleFilter} onSecretTrigger={openAdmin} />

        <main className="flex-1 min-w-0 w-full max-w-2xl border-r border-slate-800 p-2.5 xs:p-3 sm:p-6 pb-20 overflow-x-hidden">
          <FeedHeader
            query={query}
            onQuery={setQuery}
            weather={weather}
            pharmacy={data?.pharmacy ?? null}
            pharmacyState={loading ? "loading" : data.pharmacy ? "ok" : data.pharmacyError ? "error" : "none"}
          />
          <FeedStream feed={feed} loading={loading} backendError={backendError} />
        </main>

        <RightRail
          weather={weather}
          pharmacy={data?.pharmacy ?? null}
          pharmacyState={loading ? "loading" : data.pharmacy ? "ok" : data.pharmacyError ? "error" : "none"}
          items={items}
          itemsState={loading ? "loading" : data.items === null ? "error" : "ok"}
        />
      </div>

      {isAdmin && <AdminFloatingBar onPanel={() => setPanelOpen(true)} onLogout={handleLogout} />}

      {loginOpen && (
        <AdminLoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={() => {
            setIsAdmin(true);
            setLoginOpen(false);
            setPanelOpen(true);
          }}
        />
      )}

      {panelOpen && isAdmin && (
        <AdminPanelModal
          events={events}
          items={items}
          onClose={() => setPanelOpen(false)}
          onChanged={() => router.refresh()}
          onUnauthorized={() => {
            setIsAdmin(false);
            setPanelOpen(false);
          }}
        />
      )}
    </>
  );
}
