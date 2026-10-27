import type { EventListing } from "@/lib/events/types";
import type { CheckoutApi } from "@/lib/orders/client";
import { EventRow } from "./EventRow";

/**
 * Story 1: the list of upcoming events. All text is rendered through React, which escapes it,
 * so officer-entered titles and descriptions always show as plain text (SEC-20).
 * Never use dangerouslySetInnerHTML here.
 */
export function EventList({ events, api }: { events: EventListing[]; api?: CheckoutApi }) {
  if (events.length === 0) {
    return (
      <div className="empty">
        <p className="empty-title">No upcoming events yet.</p>
        <p className="empty-hint">Clubs add new events throughout the semester. Check back soon.</p>
      </div>
    );
  }

  return (
    <ul className="event-list">
      {events.map((e) => (
        <li key={e.eventId}>
          <EventRow event={e} api={api} />
        </li>
      ))}
    </ul>
  );
}
