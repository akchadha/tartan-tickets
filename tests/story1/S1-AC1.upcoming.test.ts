// Story 1, AC1: THE system SHALL list upcoming events with the date, location,
// price, and seats remaining.  (Which events count as "upcoming" = assumption #3.)
import { describe, expect, it } from "vitest";
import { listUpcomingEvents } from "@/lib/events/upcoming";
import { makeEvent, NOW } from "../helpers";

describe("S1-AC1 which events are listed", () => {
  it("S1-AC1 lists published events that have not started, soonest first", () => {
    const later = makeEvent({ eventId: "later", startsAt: "2026-11-20T23:00:00Z" });
    const sooner = makeEvent({ eventId: "sooner", startsAt: "2026-10-02T23:00:00Z" });
    const result = listUpcomingEvents([later, sooner], NOW);
    expect(result.map((e) => e.eventId)).toEqual(["sooner", "later"]);
  });

  it("S1-AC1 hides events that have already started", () => {
    const started = makeEvent({ eventId: "started", startsAt: "2026-10-01T15:00:00Z" });
    const startingNow = makeEvent({ eventId: "now", startsAt: NOW.toISOString() });
    expect(listUpcomingEvents([started, startingNow], NOW)).toEqual([]);
  });

  it("S1-AC1 hides cancelled and draft events", () => {
    const cancelled = makeEvent({ eventId: "c", status: "cancelled" });
    const draft = makeEvent({ eventId: "d", status: "draft" });
    const live = makeEvent({ eventId: "live" });
    expect(listUpcomingEvents([cancelled, draft, live], NOW).map((e) => e.eventId)).toEqual(["live"]);
  });

  it("S1-AC1 computes seats remaining as capacity minus seats sold", () => {
    const [listing] = listUpcomingEvents([makeEvent({ capacity: 120, seatsSold: 97 })], NOW);
    expect(listing.seatsRemaining).toBe(23);
    expect(listing.soldOut).toBe(false);
  });

  it("S1-AC1 never reports negative seats, and marks zero as sold out", () => {
    const [listing] = listUpcomingEvents([makeEvent({ capacity: 10, seatsSold: 12 })], NOW);
    expect(listing.seatsRemaining).toBe(0);
    expect(listing.soldOut).toBe(true);
  });

  it("S1-AC1 exposes only browse fields (no internal counts or status)", () => {
    const [listing] = listUpcomingEvents([makeEvent()], NOW);
    expect(Object.keys(listing).sort()).toEqual(
      ["clubName", "description", "eventId", "location", "priceCents", "seatsRemaining", "soldOut", "startsAt", "title"].sort(),
    );
  });
});
