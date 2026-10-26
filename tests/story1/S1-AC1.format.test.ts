// Story 1, AC1: how date, price, and seats remaining are written (assumptions #6, #7, #9).
import { describe, expect, it } from "vitest";
import { formatEventDate, formatPrice, formatSeats } from "@/lib/events/format";

describe("S1-AC1 price", () => {
  it("S1-AC1 shows dollars and cents", () => {
    expect(formatPrice(1200)).toBe("$12.00");
    expect(formatPrice(550)).toBe("$5.50");
  });
  it("S1-AC1 shows Free for $0 events", () => {
    expect(formatPrice(0)).toBe("Free");
  });
});

describe("S1-AC1 date", () => {
  it("S1-AC1 shows Pittsburgh time during daylight saving", () => {
    expect(formatEventDate("2026-10-16T23:00:00Z")).toBe("Fri, Oct 16, 7:00 PM");
  });
  it("S1-AC1 shows Pittsburgh time in winter, including the date rolling back", () => {
    expect(formatEventDate("2026-12-05T00:00:00Z")).toBe("Fri, Dec 4, 7:00 PM");
  });
});

describe("S1-AC1 seats remaining", () => {
  it("S1-AC1 shows the exact count", () => {
    expect(formatSeats(23)).toBe("23 seats left");
  });
  it("S1-AC1 uses the singular for one seat", () => {
    expect(formatSeats(1)).toBe("1 seat left");
  });
  it("S1-AC1 shows Sold out at zero", () => {
    expect(formatSeats(0)).toBe("Sold out");
  });
});
