// Story 3, AC4: IF a card is declined, THEN THE system SHALL release the held seats.
import { describe, expect, it } from "vitest";
import { setup } from "./helpers";

describe("S3-AC4 declined payment", () => {
  it("S3-AC4 a declined payment releases the held seats immediately", () => {
    const { t, buy, seatsLeft } = setup({ capacity: 10 });
    const r = buy(4);
    if (!r.ok) throw new Error("expected a hold");
    expect(seatsLeft()).toBe(6);
    const declined = t.decline(r.value.orderId);
    expect(declined).toMatchObject({ ok: true, value: { status: "released", tickets: [] } });
    expect(seatsLeft()).toBe(10);
  });

  it("S3-AC4 a declined order cannot be paid afterwards", () => {
    const { t, buy } = setup();
    const r = buy(2);
    if (!r.ok) throw new Error("expected a hold");
    t.decline(r.value.orderId);
    expect(t.pay(r.value.orderId)).toMatchObject({ ok: false, status: 409, code: "not_held" });
  });
});
