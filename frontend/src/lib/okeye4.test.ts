import { describe, expect, it, beforeEach } from "vitest";
import {
  getLobbies,
  createLobby,
  applyToLobby,
  respondToRequest,
  formatTimeRemaining,
} from "./okeye4";

describe("okeye4 modülü", () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    const mockStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      clear: () => {
        store = {};
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    };
    (globalThis as unknown as { window: unknown }).window = { localStorage: mockStorage };
    (globalThis as unknown as { localStorage: unknown }).localStorage = mockStorage;
  });

  it("varsayılan olarak seed masaları döner", () => {
    const list = getLobbies();
    expect(list.length).toBeGreaterThanOrEqual(4);
    expect(list[0].id).toBe("lobby-1");
    expect(list[0].category).toBe("okey");
  });

  it("yeni masa ilanı açılabilir", () => {
    const newLobby = createLobby({
      category: "mac",
      title: "Derbi İzleme Masası",
      venue: "Nihavent Pub",
      host: {
        name: "Test Host",
        handle: "test_host",
        avatar: "⚽",
      },
      totalCount: 4,
      neededCount: 1,
      currentCount: 3,
      note: "Hemen başlayacağız",
      expiresInMinutes: 60,
    });

    expect(newLobby.id).toBeDefined();
    expect(newLobby.status).toBe("open");

    const all = getLobbies();
    expect(all[0].title).toBe("Derbi İzleme Masası");
  });

  it("masaya katılım talebi (Gelebilir miyim?) gönderilebilir", () => {
    const res = applyToLobby(
      "lobby-1",
      {
        name: "Aday 1",
        handle: "aday_1",
        avatar: "🙋‍♂️",
      },
      "Geliyorum bekleyin"
    );

    expect(res.success).toBe(true);
    const lobby = getLobbies().find((l) => l.id === "lobby-1");
    expect(lobby?.requests.some((r) => r.user.handle === "aday_1")).toBe(true);

    // Aynı kişi ikinci kez başvurursa hata vermeli
    const second = applyToLobby(
      "lobby-1",
      {
        name: "Aday 1",
        handle: "aday_1",
        avatar: "🙋‍♂️",
      },
      "İkinci başvuru"
    );
    expect(second.success).toBe(false);
  });

  it("masa sahibi katılım talebini onaylayabilir ve masa dolunca status filled olur", () => {
    const lobby = getLobbies().find((l) => l.id === "lobby-1")!;
    const reqId = lobby.requests[0].id; // req-101 (Ahmet)

    // lobby-1 neededCount: 1, currentCount: 3
    const res = respondToRequest("lobby-1", reqId, true);
    expect(res.success).toBe(true);
    expect(res.lobby?.status).toBe("filled");
    expect(res.lobby?.currentCount).toBe(4);
    expect(res.lobby?.neededCount).toBe(0);
  });

  it("masa sahibi katılım talebini reddedebilir", () => {
    const lobby = getLobbies().find((l) => l.id === "lobby-1")!;
    const reqId = lobby.requests[0].id;

    const res = respondToRequest("lobby-1", reqId, false);
    expect(res.success).toBe(true);
    const updated = getLobbies().find((l) => l.id === "lobby-1");
    expect(updated?.requests.find((r) => r.id === reqId)?.status).toBe("rejected");
  });

  it("formatTimeRemaining kalan süreyi ve aciliyeti hesaplar", () => {
    const nowIso = new Date().toISOString();
    const info = formatTimeRemaining(nowIso, 15);
    expect(info.isUrgent).toBe(true);
    expect(info.isExpired).toBe(false);

    const pastIso = new Date(Date.now() - 100 * 60 * 1000).toISOString();
    const expiredInfo = formatTimeRemaining(pastIso, 60);
    expect(expiredInfo.isExpired).toBe(true);
  });
});
