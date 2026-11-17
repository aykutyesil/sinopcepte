"use client";

import { useEffect, useMemo, useState } from "react";
import { daysLabel, fetchDolmus, formatCountdown, groupByStop, nowMinutes, type DolmusData, type DolmusPoint } from "@/lib/dolmus";

function PointCard({ point, nowMin }: { point: DolmusPoint; nowMin: number }) {
  const day = daysLabel(point.days);
  const [showAll, setShowAll] = useState(false);
  return (
    <div className="rounded-xl p-4 bg-[#111318] border border-slate-800/80">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
          📍 {point.from} kalkış
        </p>
        {day && <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">{day}</span>}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] text-slate-400">Sıradaki kalkış</p>
          <p className="text-4xl font-bold text-white font-mono tabular-nums" data-testid="next-departure">
            {point.next[0] ?? "—"}
          </p>
        </div>
        <p className="text-sm font-bold text-emerald-400 text-right">{formatCountdown(point.minutesToNext)}</p>
      </div>

      {point.next.length > 0 ? (
        <div className="mt-4">
          <p className="text-[11px] text-slate-400 mb-1.5">Şimdiden sonraki {point.next.length} sefer</p>
          <ul className="flex gap-2">
            {point.next.map((t) => (
              <li key={t} className="flex-1 text-center py-2 rounded-lg bg-slate-900 border border-slate-800 font-mono font-bold text-sm text-slate-100">
                {t}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-xs text-slate-300">Bugünkü seferler bitti. İlk sefer yarın {point.firstDeparture} civarı (hafta sonu/içi tarifesi değişebilir).</p>
      )}

      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        aria-expanded={showAll}
        className="mt-3 w-full py-2 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:border-slate-700 transition"
      >
        {showAll ? "Saatleri gizle ▲" : `Tüm sefer saatlerini göster (${point.times.length}) ▼`}
      </button>
      {showAll && (
        <ul className="mt-2 grid grid-cols-4 sm:grid-cols-5 gap-1.5" data-testid="all-times">
          {point.times.map((t) => {
            const mins = Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
            const past = mins < nowMin;
            const isNext = t === point.next[0];
            return (
              <li
                key={t}
                className={`text-center py-1.5 rounded-md font-mono text-xs border ${
                  isNext
                    ? "bg-rose-600 border-rose-500 text-white font-bold"
                    : past
                      ? "bg-slate-900/40 border-slate-800/60 text-slate-600 line-through"
                      : "bg-slate-900 border-slate-800 text-slate-100"
                }`}
              >
                {t}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 text-[11px] text-slate-400">
        Bugün ilk / son sefer: <span className="text-slate-200 font-mono">{point.firstDeparture} / {point.lastDeparture}</span>
      </p>
      {point.note && <p className="mt-1 text-[11px] text-slate-500">{point.note}</p>}
    </div>
  );
}

function StopView({ data }: { data: DolmusData }) {
  const [showAll, setShowAll] = useState(false);
  const groups = useMemo(() => groupByStop(data, 8, showAll), [data, showAll]);
  const [stop, setStop] = useState<string | null>(null);
  const group = groups.find((g) => g.stop === stop) ?? groups[0];
  if (!group) return null;
  const firstUpcoming = group.departures.find((d) => d.minutes >= 0)?.time;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">Hangi duraktasın?</p>
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Durak seç">
        {groups.map((g) => (
          <button
            key={g.stop}
            type="button"
            role="tab"
            aria-selected={g.stop === group.stop}
            onClick={() => setStop(g.stop)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
              g.stop === group.stop
                ? "bg-rose-600 border-rose-500 text-white"
                : "bg-[#111318] border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            {g.stop}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-[#111318] border border-slate-800/80 overflow-hidden">
        <p className="px-4 pt-3 pb-2 text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
          📍 {group.stop} — yaklaşan kalkışlar
        </p>
        {group.departures.length === 0 ? (
          <p className="px-4 pb-4 text-xs text-slate-300">Bu duraktan bugün için kalkış kalmadı.</p>
        ) : (
          <ul className={`divide-y divide-slate-800/80 ${showAll ? "max-h-96 overflow-y-auto" : ""}`}>
            {group.departures.map((d) => {
              const past = d.minutes < 0;
              const first = d.minutes >= 0 && d.time === firstUpcoming;
              return (
                <li
                  key={`${d.lineId}-${d.time}`}
                  className={`flex items-center gap-3 px-4 py-2.5 ${first ? "bg-rose-500/5" : ""} ${past ? "opacity-40" : ""}`}
                  data-testid={first ? "next-departure" : undefined}
                >
                  <span className={`font-mono font-bold tabular-nums ${first ? "text-2xl text-white" : "text-lg text-slate-200"} ${past ? "line-through" : ""}`}>
                    {d.time}
                  </span>
                  <span className="min-w-0 flex-1 text-xs text-slate-300 truncate">{d.lineName}</span>
                  <span className={`shrink-0 text-xs font-bold ${first ? "text-emerald-400" : "text-slate-400"}`}>
                    {past ? "geçti" : formatCountdown(d.minutes)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        aria-pressed={showAll}
        className="w-full py-2 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:border-slate-700 transition"
      >
        {showAll ? "Sadece yaklaşanları göster ▲" : "Bu duraktan tüm gün kalkışlarını göster ▼"}
      </button>
    </div>
  );
}

export function DolmusFeed() {
  const [data, setData] = useState<DolmusData | null>(null);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<"stop" | "line">("stop");

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetchDolmus()
        .then((d) => {
          if (!alive) return;
          setData(d);
          setError(false);
        })
        .catch(() => {
          if (alive) setError(true);
        });
    load();
    const timer = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  if (error && !data) {
    return <p className="text-sm text-slate-400 p-4">Dolmuş saatleri şu an alınamadı.</p>;
  }
  if (!data) {
    return <p className="text-sm text-slate-400 p-4">Yükleniyor...</p>;
  }

  const line = data.lines.find((l) => l.id === selected) ?? data.lines[0];

  return (
    <section className="space-y-3" aria-label="Dolmuş saatleri">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <h2 className="text-sm font-bold text-white">🚐 Şehir İçi Dolmuş Saatleri</h2>
        <span className="text-[10px] font-mono text-slate-500 ml-auto">
          Şimdi {new Date(data.now).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" })}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#111318] border border-slate-800/80" role="tablist" aria-label="Görünüm">
        {([["stop", "📍 Duraktan bak"], ["line", "🚐 Hat seç"]] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={mode === key}
            onClick={() => setMode(key)}
            className={`py-2 rounded-lg text-xs font-bold transition ${mode === key ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "stop" && <StopView data={data} />}

      {mode === "line" && <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Hat seç">
        {data.lines.map((l) => (
          <button
            key={l.id}
            type="button"
            role="tab"
            aria-selected={l.id === line?.id}
            onClick={() => setSelected(l.id)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition ${
              l.id === line?.id
                ? "bg-rose-600 border-rose-500 text-white"
                : "bg-[#111318] border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>}

      {mode === "line" && line && (
        <>
          <h3 className="text-base font-bold text-white">{line.name}</h3>
          {line.points.length > 0 ? (
            line.points.map((p) => <PointCard key={`${p.from}-${p.days}`} point={p} nowMin={nowMinutes(data.now)} />)
          ) : (
            <p className="text-xs text-slate-300 rounded-xl p-4 bg-[#111318] border border-slate-800/80">
              Bu hat bugün (hafta sonu/içi tarifesine göre) sefer yapmıyor.
            </p>
          )}
        </>
      )}

      <p className="text-[10px] leading-relaxed text-amber-300/80 bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5">
        ⚠️ {data.disclaimer} Kaynak: {data.source}. Veri alınma tarihi: {data.retrievedAt}.
      </p>
    </section>
  );
}
