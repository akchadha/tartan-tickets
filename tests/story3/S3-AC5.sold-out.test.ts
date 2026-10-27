// Story 3, AC5: IF the event sells out during checkout, THEN THE system SHALL offer the waitlist.
// The waitlist is Story 4, so (assumption 4) the student is told it opens in a later update.
import { describe, expect, it } from "vitest";
import { setup } from "./helpers";

describe("S3-AC5 selling out during checkout", () => {
  it("S3-AC5 when another student takes the last seats first, the hold is refused with a sold-out message", () => {
    const { buy } = setup({ capacity: 10, seatsSold: 8 });
    expect(buy(2, "Ben").ok).toBe(true); // Ben gets the last 2
    const r = buy(1, "Ada");
    expect(r).toMatchObject({ ok: false, status: 409, code: "sold_out" });
    if (!r.ok) expect(r.message).toMatch(/waitlist opens in a later update/i);
  });

  it("S3-AC5 when fewer seats remain than requested, the student is told how many are left", () => {
    const { buy } = setup({ capacity: 10, seatsSold: 8 });
    const r = buy(4);
    expect(r).toMatchObject({ ok: false, status: 409, code: "not_enough_seats" });
    if (!r.ok) expect(r.message).toContain("Only 2 seats left");
  });
});
