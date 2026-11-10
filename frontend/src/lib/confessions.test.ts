import { describe, it, expect, beforeEach } from "vitest";
import {
  CONFESSION_CATEGORIES,
  getConfessions,
  setInMemoryConfessionsForTesting,
  type Confession,
} from "./confessions";

describe("confessions lib", () => {
  beforeEach(() => {
    setInMemoryConfessionsForTesting([]);
  });

  it("exports correct categories configuration", () => {
    expect(CONFESSION_CATEGORIES.gece.label).toBe("Gece Hayatı");
    expect(CONFESSION_CATEGORIES.mekan.icon).toBe("🍸");
    expect(CONFESSION_CATEGORIES.kampus.label).toBe("SNÜ Kampüs");
    expect(CONFESSION_CATEGORIES.ask.icon).toBe("💘");
  });

  it("handles in-memory confessions store", () => {
    const mockConfession: Confession = {
      id: "conf-1",
      aliasName: "Gizli Martı #104",
      aliasAvatar: "marti",
      category: "gece",
      body: "Test itiraf mesajı",
      fireCount: 3,
      laughCount: 1,
      shockCount: 0,
      heartCount: 5,
      reportCount: 0,
      comments: [],
      createdAt: "2026-11-10T20:00:00Z",
    };

    setInMemoryConfessionsForTesting([mockConfession]);
    const list = getConfessions();
    expect(list).toHaveLength(1);
    expect(list[0].aliasName).toBe("Gizli Martı #104");
    expect(list[0].fireCount).toBe(3);
  });
});
