// @vitest-environment node
// API contract §5: GET /api/events → 200 with the upcoming events.
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/events/route";

describe("S1-AC1 GET /api/events", () => {
  it("S1-AC1 returns 200 with upcoming events and their browse fields", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = await res.json();
    expect(Array.isArray(body.events)).toBe(true);
    expect(body.events.length).toBeGreaterThan(0);
    for (const e of body.events) {
      expect(e).toEqual(
        expect.objectContaining({
          title: expect.any(String),
          startsAt: expect.any(String),
          location: expect.any(String),
          priceCents: expect.any(Number),
          seatsRemaining: expect.any(Number),
        }),
      );
      expect(e).not.toHaveProperty("seatsSold");
      expect(e).not.toHaveProperty("status");
    }
  });
});
