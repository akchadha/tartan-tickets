import type { EventListing, EventRecord } from "@/lib/events/types";

export const NOW = new Date("2026-10-01T16:00:00Z"); // Thu Oct 1, 12:00 PM Pittsburgh

export function makeEvent(overrides: Partial<EventRecord> = {}): EventRecord {
  return {
    eventId: overrides.eventId ?? "evt_" + Math.random().toString(36).slice(2),
    clubName: "Test Club",
    title: "Test Event",
    description: "A test event.",
    startsAt: "2026-10-16T23:00:00Z",
    location: "Rangos Ballroom",
    priceCents: 1200,
    capacity: 100,
    seatsSold: 0,
    status: "published",
    ...overrides,
  };
}

export function makeListing(overrides: Partial<EventListing> = {}): EventListing {
  return {
    eventId: "evt_listing",
    clubName: "Highland Dance Club",
    title: "Fall Ceilidh",
    description: "Scottish dancing, no experience needed.",
    startsAt: "2026-10-16T23:00:00Z",
    location: "Rangos Ballroom",
    priceCents: 1200,
    seatsRemaining: 23,
    soldOut: false,
    ...overrides,
  };
}
