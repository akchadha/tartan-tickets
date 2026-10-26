/** One event as stored on the server (mirrors the `events` table in requirements.md §4). */
export type EventStatus = "published" | "draft" | "cancelled";

export interface EventRecord {
  eventId: string;
  clubName: string;
  title: string;
  description: string;
  /** ISO 8601 timestamp in UTC. */
  startsAt: string;
  location: string;
  priceCents: number;
  capacity: number;
  /** Seats already sold. Orders arrive in Story 3; until then this is set in sample data. */
  seatsSold: number;
  status: EventStatus;
}

/** What the browse page is allowed to show about an event. */
export interface EventListing {
  eventId: string;
  clubName: string;
  title: string;
  description: string;
  startsAt: string;
  location: string;
  priceCents: number;
  seatsRemaining: number;
  soldOut: boolean;
}
