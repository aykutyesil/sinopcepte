import { describe, expect, it, beforeEach } from "vitest";
import {
  getLobbies,
  saveLobbies,
  createLobby,
  applyToLobby,
  respondToRequest,
  formatTimeRemaining,
  type Lobby,
} from "./okeye4";

const TEST_LOBBY: Lobby = {
  id: "lobby-1",
  category: "okey",
  title: "101 Okey'e Acil 4. Lazım!",
  venue: "Mathiday's Social Club",
  locationDetails: "Alt kat sigara içilen alan, 7 no'lu masa",
  host: {
    handle: "serhat_snk",
    name: "Serhat K.",
    avatar: "👨‍🦱",
    phone: "0532 578 11 22",
    wa: "905325781122",
  },
  neededCount: 1,
  currentCount: 3,
  totalCount: 4,
  note: "Taş çalmayan seri oyuncu arıyoruz.",
  createdAt: new Date().toISOString(),
  expiresInMinutes: 120,
  status: "open",
  requests: [
    {
      id: "req-101",
      user: {
        handle: "ahmet_57",
        name: "Ahmet",
        avatar: "🎲",
      },
      note: "10 dk içinde oradayım!",
      createdAt: new Date().toISOString(),
      status: "pending",
    },
  ],
};

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
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: mockStorage,
      dispatchEvent: () => true,
    };
    (globalThis as unknown as { localStorage: unknown }).localStorage = mockStorage;
    saveLobbies([{ ...TEST_LOBBY }]);
  });

  it("masaları döner", () => {
    const list = getLobbies();
    expect(list.length).toBeGreaterThanOrEqual(1);
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
    const reqId = lobby.requests[0].id;

    const res = respondToRequest("lobby-1", reqId, true);
    expect(res.success).toBe(true);
    expect(res.lobby?.status).toBe("filled");
    expect(res.lobby?.currentCount).toBe(4);
    expect(res.lobby?.neededCount).toBe(0);
  });

  it("kalan süreyi formatlar", () => {
    const nowIso = new Date().toISOString();
    const remaining = formatTimeRemaining(nowIso, 120);
    expect(remaining.isExpired).toBe(false);
    expect(remaining.text).toContain("sa");

    const expiredIso = new Date(Date.now() - 3600000 * 3).toISOString();
    const expRemaining = formatTimeRemaining(expiredIso, 120);
    expect(expRemaining.isExpired).toBe(true);
    expect(expRemaining.text).toBe("Süre Doldu");
  });
});
