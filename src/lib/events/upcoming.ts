import type { EventListing, EventRecord } from "./types";

/**
 * Story 1, AC1: the events a student can browse.
 * "Upcoming" = published and not yet started (assumption #3), soonest first (assumption #4).
 */
export function listUpcomingEvents(events: EventRecord[], now: Date): EventListing[] {
  const nowMs = now.getTime();
  return events
    .filter((e) => e.status === "published" && Date.parse(e.startsAt) > nowMs)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .map(toListing);
}

function toListing(e: EventRecord): EventListing {
  const seatsRemaining = Math.max(0, e.capacity - e.seatsSold);
  // Build the object field by field so internal fields (seatsSold, status) can never leak.
  return {
    eventId: e.eventId,
    clubName: e.clubName,
    title: e.title,
    description: e.description,
    startsAt: e.startsAt,
    location: e.location,
    priceCents: e.priceCents,
    seatsRemaining,
    soldOut: seatsRemaining === 0,
  };
}
