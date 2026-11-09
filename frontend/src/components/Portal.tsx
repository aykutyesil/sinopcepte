"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildFeed } from "@/lib/feed";
import { fetchMe, isAdmin as hasAdminRole, logout } from "@/lib/client-api";
import type { AuthUser, FeedFilter, PortalData } from "@/lib/types";
import { useWeather } from "@/hooks/useWeather";
import { Dock } from "./Dock";
import { FeedHeader } from "./FeedHeader";
import { FeedStream } from "./FeedStream";
import { RightRail } from "./rail/RightRail";
import { AdminFloatingBar } from "./admin/AdminFloatingBar";
import { AdminLoginModal } from "./admin/AdminLoginModal";
import { AdminPanelModal } from "./admin/AdminPanelModal";
import { Okeye4Feed } from "./okeye4/Okeye4Feed";
import { Okeye4Widget } from "./okeye4/Okeye4Widget";
import { NotificationsModal } from "./notifications/NotificationsModal";

// Legacy portal.html SPA düzeni: sol dock (20-30), orta akış (32-230), sağ ray (231-314).
// SSR'dan `data` dolu gelir (yükleniyor durumu yok); yalnız istemci yenilemelerinde `null` olabilir.

export function Portal({ data }: { data: PortalData | null }) {
  const router = useRouter();
  const weather = useWeather();

  const [filter, setFilter] = useState<FeedFilter>("all");
  const [query, setQuery] = useState("");
  const [me, setMe] = useState<AuthUser | null | undefined>(undefined);
  const [loginOpen, setLoginOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const loading = data === null;
  // Props'tan türet (state'e kopyalama yok) → router.refresh() sonrası akış güncellenir.
  const items = useMemo(() => data?.items ?? [], [data]);
  const events = useMemo(() => data?.events ?? [], [data]);
  const backendError = !loading && (data.items === null || data.events === null);

  const feed = useMemo(() => buildFeed({ events, items, filter, query }), [events, items, filter, query]);

  // Oturum durumunu backend'den al. Sekme odağı ve görünürlük değişiminde tazele
  useEffect(() => {
    let alive = true;
    const loadUser = () => {
      fetchMe().then((u) => {
        if (alive) setMe(u);
      }).catch(() => {
        if (alive) setMe(null);
      });
    };
    loadUser();

    const onFocus = () => loadUser();
    window.addEventListener("focus", onFocus);
    window.addEventListener("visibilitychange", onFocus);
    return () => {
      alive = false;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

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
    setMe(null);
    setPanelOpen(false);
    alert("Yönetici çıkışı yapıldı.");
    window.location.href = "/";
  };

  const isAdmin = hasAdminRole(me ?? null);

  return (
    <>
      <div className="max-w-7xl mx-auto flex min-h-screen w-full overflow-x-hidden">
        <Dock
          filter={filter}
          onFilter={handleFilter}
          onSecretTrigger={openAdmin}
          onOpenNotifications={() => setNotifOpen(true)}
          me={me}
        />

        <main className="flex-1 min-w-0 w-full max-w-2xl border-r border-slate-800 p-2.5 xs:p-3 sm:p-6 pb-20 overflow-x-hidden">
          <FeedHeader
            query={query}
            onQuery={setQuery}
            weather={weather}
            pharmacy={data?.pharmacy ?? null}
            pharmacyState={loading ? "loading" : data.pharmacy ? "ok" : data.pharmacyError ? "error" : "none"}
            onOpenNotifications={() => setNotifOpen(true)}
          />

          {filter === "okeye4" ? (
            <Okeye4Feed me={me} />
          ) : (
            <>
              {filter === "all" && !query && (
                <Okeye4Widget
                  onViewAll={() => handleFilter("okeye4")}
                  onOpenCreate={() => handleFilter("okeye4")}
                />
              )}
              <FeedStream feed={feed} loading={loading} backendError={backendError} currentUser={me} />
            </>
          )}
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

      {/* 🔔 Canlı Bildirimler Modalı */}
      <NotificationsModal
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        onNavigateFilter={handleFilter}
      />

      {loginOpen && (
        <AdminLoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={() => {
            // Modal yalnız ADMIN rolünü doğruladıktan sonra çağırır; dock için tam `Me` yeniden okunur.
            setMe((prev) => (hasAdminRole(prev ?? null) ? prev : { username: "", roles: ["ADMIN"] }));
            setLoginOpen(false);
            setPanelOpen(true);
            fetchMe().then(setMe);
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
            setMe(null);
            setPanelOpen(false);
          }}
        />
      )}
    </>
  );
}
