import { avatarEmoji } from "@/lib/avatars";
import { formatJoinDate } from "@/lib/format";
import type { PublicProfile } from "@/lib/types";
import { instagramUrl, validateInstagram } from "@/lib/validation";
import { CARD } from "../auth/ui";

/** Rozet şekli N8'de belirlenecek: dize ya da `{label|name|title, icon|emoji}` nesnesi savunmacı okunur. */
function badgeView(b: unknown, i: number): { key: string; icon: string | null; label: string } | null {
  if (typeof b === "string" && b.trim()) return { key: `${i}:${b}`, icon: null, label: b };
  if (b && typeof b === "object") {
    const o = b as Record<string, unknown>;
    const pick = (...ks: string[]) => {
      for (const k of ks) if (typeof o[k] === "string" && (o[k] as string).trim()) return o[k] as string;
      return null;
    };
    const label = pick("label", "name", "title", "key");
    if (!label) return null;
    return { key: `${i}:${label}`, icon: pick("icon", "emoji"), label };
  }
  return null;
}

export function PublicProfileCard({ profile }: { profile: PublicProfile }) {
  const joined = formatJoinDate(profile.createdAt);
  const ig = profile.instagram && !validateInstagram(profile.instagram) ? profile.instagram : null;
  const badges = (Array.isArray(profile.badges) ? profile.badges : [])
    .map(badgeView)
    .filter((b): b is NonNullable<typeof b> => b !== null);

  return (
    <div className="space-y-4">
      <section className={CARD}>
        <div className="flex flex-col items-center text-center">
          <div className="story-ring">
            <div className="w-24 h-24 rounded-full bg-[#0f1428] flex items-center justify-center text-5xl" aria-hidden="true">
              {avatarEmoji(profile.avatar)}
            </div>
          </div>
          <h1 className="mt-3 text-2xl font-black text-white font-display break-all">@{profile.handle}</h1>
          {joined && <p className="text-xs text-slate-400 mt-1">{joined} tarihinde katıldı</p>}
          {profile.bio && (
            <p className="mt-4 text-sm text-slate-200 whitespace-pre-line break-words max-w-full">{profile.bio}</p>
          )}
          {ig && (
            <a
              href={instagramUrl(ig)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 max-w-full text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-pink-300 transition"
            >
              <span aria-hidden="true">📸</span>
              <span className="truncate">@{ig}</span>
            </a>
          )}
        </div>
      </section>

      <section className={CARD}>
        <h2 className="text-sm font-black text-white mb-3">Rozetler</h2>
        {badges.length === 0 ? (
          <p className="text-xs text-slate-400">Henüz rozet yok</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <li
                key={b.key}
                className="text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 max-w-full truncate"
              >
                {b.icon && <span className="mr-1">{b.icon}</span>}
                {b.label}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
