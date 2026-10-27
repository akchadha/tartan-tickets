// Story 3, AC1: WHEN a student buys tickets, THE system SHALL cap the order at 4 seats.
import { describe, expect, it } from "vitest";
import { setup } from "./helpers";

describe("S3-AC1 order cap of 4 seats", () => {
  it("S3-AC1 accepts orders of 1, 2, 3, and 4 seats", () => {
    for (const seats of [1, 2, 3, 4]) {
      const { buy } = setup();
      const r = buy(seats);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value.seats).toBe(seats);
    }
  });

  it("S3-AC1 refuses an order for 5 seats with status 400", () => {
    const { buy, seatsLeft } = setup();
    const r = buy(5);
    expect(r).toMatchObject({ ok: false, status: 400, code: "too_many_seats" });
    expect(seatsLeft()).toBe(10); // nothing was held
  });

  it("S3-AC1 refuses zero, negative, decimal, text, and missing seat counts", () => {
    for (const seats of [0, -1, 2.5, "2", "abc", null, undefined, Number.NaN]) {
      const { buy } = setup();
      expect(buy(seats)).toMatchObject({ ok: false, status: 400, code: "invalid_seats" });
    }
  });
});
