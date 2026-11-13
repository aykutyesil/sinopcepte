import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  TAXI_POPULAR_DEPARTURES,
  TAXI_POPULAR_DESTINATIONS,
  fetchTaxiLobbies,
  createTaxiLobby,
  joinTaxiLobby,
  leaveTaxiLobby,
  cancelTaxiLobby,
  type TaxiLobby,
} from "./taxi";

describe("taxi modülü", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("popüler kalkış ve varış sabitlerini içerir", () => {
    expect(TAXI_POPULAR_DESTINATIONS.length).toBeGreaterThan(0);
    expect(TAXI_POPULAR_DESTINATIONS).toContain("Sinop Havalimanı (SNU)");
    expect(TAXI_POPULAR_DESTINATIONS).toContain("Sinop Otogarı");

    expect(TAXI_POPULAR_DEPARTURES.length).toBeGreaterThan(0);
    expect(TAXI_POPULAR_DEPARTURES).toContain("Sinop Valilik Önü / Meydan");
  });

  it("fetchTaxiLobbies query parametrelerini doğru iletir", async () => {
    const mockLobbies: Partial<TaxiLobby>[] = [
      {
        id: "tl-1",
        destination: "Sinop Havalimanı (SNU)",
        departurePoint: "Valilik Önü",
        departureTime: "Bugün 18:00",
        totalSeats: 4,
        occupiedSeats: 2,
        status: "OPEN",
      },
    ];

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockLobbies,
    } as Response);

    const result = await fetchTaxiLobbies({ destination: "Havalimanı", status: "OPEN" });
    expect(result).toEqual(mockLobbies);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("destination=Havaliman%C4%B1&status=OPEN"),
      expect.any(Object)
    );
  });

  it("createTaxiLobby POST isteği gönderir ve veriyi döner", async () => {
    const createdMock: Partial<TaxiLobby> = {
      id: "tl-new",
      destination: "SNÜ Kampüs",
      departurePoint: "Otogar",
      totalSeats: 4,
      occupiedSeats: 1,
      status: "OPEN",
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => createdMock,
    } as Response);

    const payload = {
      destination: "SNÜ Kampüs",
      departurePoint: "Otogar",
      departureTime: "Yarın 09:00",
      totalSeats: 4,
    };

    const res = await createTaxiLobby(payload);
    expect(res).toEqual(createdMock);
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/taxi/lobbies",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      })
    );
  });

  it("joinTaxiLobby POST ile lobiye katılır", async () => {
    const joinedMock: Partial<TaxiLobby> = {
      id: "tl-1",
      occupiedSeats: 3,
      status: "OPEN",
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => joinedMock,
    } as Response);

    const res = await joinTaxiLobby("tl-1", "0555 123 45 67");
    expect(res.occupiedSeats).toBe(3);
  });

  it("leaveTaxiLobby lobiden çıkış yapar", async () => {
    const leftMock: Partial<TaxiLobby> = {
      id: "tl-1",
      occupiedSeats: 2,
      status: "OPEN",
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => leftMock,
    } as Response);

    const res = await leaveTaxiLobby("tl-1");
    expect(res.occupiedSeats).toBe(2);
  });

  it("cancelTaxiLobby DELETE isteği atar", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
    } as Response);

    await cancelTaxiLobby("tl-1");
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/taxi/lobbies/tl-1",
      expect.objectContaining({ method: "DELETE" })
    );
  });
});
