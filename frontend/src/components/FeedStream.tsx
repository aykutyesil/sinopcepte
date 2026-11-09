import type { FeedResult } from "@/lib/feed";
import type { AuthUser } from "@/lib/types";
import { EventCard } from "./EventCard";
import { ItemCard } from "./ItemCard";

// Legacy `#feedStreamContainer` (220) + `renderFeedStream` boş durumu (726-728).

export function FeedStream({
  feed,
  loading,
  backendError,
  currentUser,
}: {
  feed: FeedResult;
  loading: boolean;
  backendError: boolean;
  currentUser?: AuthUser | null;
}) {
  const empty = feed.events.length === 0 && feed.items.length === 0;

  return (
    <div className="space-y-5">
      {backendError && (
        <div
          role="alert"
          className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200"
        >
          <p className="font-bold text-rose-300">Sunucuya şu an ulaşılamıyor.</p>
          <p className="mt-1 text-slate-300">Canlı akış yüklenemedi. Lütfen biraz sonra sayfayı yenileyin.</p>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Canlı akış yükleniyor...</div>
      ) : (
        <>
          {feed.events.map((ev) => (
            <EventCard key={ev.id} ev={ev} />
          ))}
          {feed.items.map((item) => (
            <ItemCard key={item.id} item={item} currentUser={currentUser} />
          ))}
          {empty && !backendError && (
            <div className="p-12 text-center text-slate-500 text-xs">Aradığınız kriterde bir akış bulunamadı.</div>
          )}
        </>
      )}
    </div>
  );
}
