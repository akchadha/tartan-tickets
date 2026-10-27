// Story 3, AC3: WHEN a payment succeeds, THE system SHALL email a receipt with a QR code within 1 minute.
// Under the HW3 scope: a "Simulated payment" button, and the receipt is shown on screen (email is a non-goal).
import { describe, expect, it } from "vitest";
import { setup } from "./helpers";

function paidOrder(seats = 3, name = "Ada Lovelace") {
  const s = setup();
  const r = s.buy(seats, name);
  if (!r.ok) throw new Error("expected a hold");
  const paid = s.t.pay(r.value.orderId);
  return { ...s, held: r.value, paid };
}

describe("S3-AC3 simulated payment issues tickets", () => {
  it("S3-AC3 issues exactly one ticket per seat and marks the order paid", () => {
    const { paid } = paidOrder(3);
    expect(paid.ok).toBe(true);
    if (!paid.ok) return;
    expect(paid.value.status).toBe("paid");
    expect(paid.value.tickets).toHaveLength(3);
  });

  it("S3-AC3 SEC-13 each QR code is unique, random (≥128 bits), and contains no personal data", () => {
    const { paid } = paidOrder(4, "Ada Lovelace");
    if (!paid.ok) throw new Error("expected payment");
    const tokens = paid.value.tickets.map((tk) => tk.qrToken);
    expect(new Set(tokens).size).toBe(4);
    for (const token of tokens) {
      expect(Buffer.from(token, "base64url").length).toBeGreaterThanOrEqual(16);
      expect(token.toLowerCase()).not.toContain("ada");
      expect(token.toLowerCase()).not.toContain("lovelace");
    }
  });

  it("S3-AC3 the server computes the total from the stored price", () => {
    const { paid } = paidOrder(3);
    expect(paid.ok && paid.value.totalCents).toBe(3600);
    expect(paid.ok && paid.value.unitPriceCents).toBe(1200);
  });

  it("S3-AC3 paying twice is refused and never doubles the tickets", () => {
    const { t, held } = paidOrder(2);
    expect(t.pay(held.orderId)).toMatchObject({ ok: false, status: 409, code: "already_paid" });
    const again = t.getOrder(held.orderId);
    expect(again.ok && again.value.tickets).toHaveLength(2);
  });

  it("S3-AC3 paid seats stay sold after the 10-minute hold window", () => {
    const { clock, seatsLeft } = paidOrder(3);
    clock.advanceMinutes(30);
    expect(seatsLeft()).toBe(7);
  });

  it("S3-AC3 free events go through the same checkout with a $0 total", () => {
    const s = setup({ priceCents: 0 });
    const r = s.buy(2);
    if (!r.ok) throw new Error("expected a hold");
    const paid = s.t.pay(r.value.orderId);
    expect(paid.ok && paid.value.totalCents).toBe(0);
    expect(paid.ok && paid.value.tickets).toHaveLength(2);
  });
});
