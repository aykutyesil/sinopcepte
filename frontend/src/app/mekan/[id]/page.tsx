import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { loadPortalData } from "@/lib/server-api";
import { getVenueProfileById } from "@/lib/venue-profile";
import { VenueProfileClient } from "@/components/venue/VenueProfileClient";
import type { Item } from "@/lib/types";

export const metadata: Metadata = {
  title: "Mekan Profili & Menü | SinopCepte",
};

export default function VenuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070913] flex items-center justify-center text-slate-400 text-xs font-mono">
          Mekan profili yükleniyor...
        </div>
      }
    >
      <VenueContent paramsPromise={params} />
    </Suspense>
  );
}

async function VenueContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const decoded = decodeURIComponent(id);
  const portalData = await loadPortalData();
  const items = portalData.items || [];
  const events = portalData.events || [];

  const profile = getVenueProfileById(decoded, items);
  if (!profile) {
    notFound();
  }

  const matchingItem: Item = items.find((i) => i.id === profile.itemId) || {
    id: profile.itemId,
    category: profile.category,
    title: profile.title,
    badge: profile.badge,
    location: profile.location,
    desc: profile.desc,
    phone: profile.phone,
    wa: profile.wa,
    rating: profile.rating,
    mapUrl: profile.mapUrl,
  };

  return (
    <VenueProfileClient
      item={matchingItem}
      initialProfile={profile}
      allItems={items}
      allEvents={events}
    />
  );
}
