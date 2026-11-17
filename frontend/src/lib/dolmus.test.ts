import { afterEach, describe, expect, it, vi } from "vitest";
import { daysLabel, fetchDolmus, formatCountdown, groupByStop, nowMinutes, stopNames } from "./dolmus";

describe("dolmus modülü", () => {
  afterEach(() => vi.restoreAllMocks());

  it("geri sayım metni", () => {
    expect(formatCountdown(null)).toBe("Bugün sefer kalmadı");
    expect(formatCountdown(0)).toBe("Şimdi kalkıyor");
    expect(formatCountdown(7)).toBe("7 dk sonra");
    expect(formatCountdown(60)).toBe("1 sa sonra");
    expect(formatCountdown(135)).toBe("2 sa 15 dk sonra");
  });

  it("durak adlarını ayırır", () => {
    expect(stopNames("SİB (Akliman seferi)")).toEqual(["SİB"]);
    expect(stopNames("Stad / KYK")).toEqual(["Stad", "KYK"]);
  });

  it("duraktan kalkışları zamana göre sıralar", () => {
    const pt = (from: string, next: string[]) => ({
      from, days: "all", firstDeparture: "07:00", lastDeparture: "18:00", next, minutesToNext: 0, times: ["09:00", ...next], note: null,
    });
    const data = {
      now: "2026-11-16T10:10+03:00", source: "s", official: false, disclaimer: "d", retrievedAt: "r",
      lines: [
        { id: "a", name: "A hattı", note: null, points: [pt("Stad / KYK", ["10:25", "10:40"])] },
        { id: "b", name: "B hattı", note: null, points: [pt("Stad", ["10:15", "10:45"])] },
      ],
    };
    expect(nowMinutes(data.now)).toBe(610);
    const stad = groupByStop(data).find((g) => g.stop === "Stad")!;
    expect(stad.departures.map((d) => [d.time, d.minutes, d.lineName])).toEqual([
      ["10:15", 5, "B hattı"],
      ["10:25", 15, "A hattı"],
      ["10:40", 30, "A hattı"],
      ["10:45", 35, "B hattı"],
    ]);
    expect(groupByStop(data).some((g) => g.stop === "KYK")).toBe(true);
    const allStad = groupByStop(data, 8, true).find((g) => g.stop === "Stad")!;
    expect(allStad.departures.map((d) => d.time)).toEqual(["09:00", "09:00", "10:15", "10:25", "10:40", "10:45"]);
    expect(allStad.departures[0].minutes).toBeLessThan(0);
  });

  it("gün etiketi", () => {
    expect(daysLabel("weekday")).toBe("Hafta içi");
    expect(daysLabel("weekend")).toBe("Hafta sonu");
    expect(daysLabel("all")).toBeNull();
  });

  it("hata durumunda fırlatır", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    await expect(fetchDolmus()).rejects.toThrow("500");
  });

  it("başarılı yanıtı döndürür", async () => {
    const body = { now: "x", source: "s", official: false, disclaimer: "d", retrievedAt: "r", lines: [] };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => body }));
    await expect(fetchDolmus()).resolves.toEqual(body);
  });
});
