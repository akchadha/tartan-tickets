// Story 3, AC2: WHEN a student starts checkout, THE system SHALL hold the seats for 10 minutes.
import { describe, expect, it } from "vitest";
import { setup } from "./helpers";

describe("S3-AC2 10-minute seat hold", () => {
  it("S3-AC2 starting checkout lowers seats left for everyone immediately", () => {
    const { buy, seatsLeft } = setup({ capacity: 10 });
    buy(3);
    expect(seatsLeft()).toBe(7);
  });

  it("S3-AC2 the hold ends exactly 10 minutes after checkout starts", () => {
    const { buy, clock } = setup();
    const r = buy(2);
    if (!r.ok) throw new Error("expected a hold");
    expect(Date.parse(r.value.holdExpiresAt) - clock.now().getTime()).toBe(10 * 60_000);
    expect(r.value.status).toBe("held");
  });

  it("S3-AC2 seats are still held at 9:59 and come back at 10:00", () => {
    const { buy, clock, seatsLeft } = setup({ capacity: 10 });
    buy(4);
    clock.advanceSeconds(9 * 60 + 59);
    expect(seatsLeft()).toBe(6);
    clock.advanceSeconds(1);
    expect(seatsLeft()).toBe(10);
  });

  it("S3-AC2 paying after the hold expired is refused and issues no tickets", () => {
    const { t, buy, clock } = setup();
    const r = buy(2);
    if (!r.ok) throw new Error("expected a hold");
    clock.advanceMinutes(10);
    expect(t.pay(r.value.orderId)).toMatchObject({ ok: false, status: 409, code: "hold_expired" });
    const after = t.getOrder(r.value.orderId);
    expect(after.ok && after.value.tickets).toEqual([]);
    expect(after.ok && after.value.status).toBe("expired");
  });

  it("S3-AC2 held seats cannot be taken by another student", () => {
    const { buy } = setup({ capacity: 3 });
    expect(buy(3, "Ada").ok).toBe(true);
    expect(buy(1, "Ben")).toMatchObject({ ok: false, status: 409, code: "sold_out" });
  });
});
