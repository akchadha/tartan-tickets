import type { EventListing } from "@/lib/events/types";
import { EVENT_TIME_ZONE, formatEventDate, formatPrice, formatSeats } from "@/lib/events/format";
import { BuyButton } from "./BuyButton";

const monthFmt = new Intl.DateTimeFormat("en-US", { timeZone: EVENT_TIME_ZONE, month: "short" });
const dayFmt = new Intl.DateTimeFormat("en-US", { timeZone: EVENT_TIME_ZONE, day: "numeric" });

/**
 * Story 1. All text is rendered through React, which escapes it, so officer-entered
 * titles and descriptions always show as plain text (SEC-20). Never use dangerouslySetInnerHTML here.
 */
export function EventList({ events }: { events: EventListing[] }) {
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
      {events.map((e) => {
        const start = new Date(e.startsAt);
        return (
          <li key={e.eventId}>
            <article className={e.soldOut ? "event is-sold-out" : "event"} aria-label={e.title}>
              <div className="event-tile" aria-hidden="true">
                <span className="event-tile-month">{monthFmt.format(start)}</span>
                <span className="event-tile-day">{dayFmt.format(start)}</span>
              </div>

              <div className="event-body">
                <p className="event-club">{e.clubName}</p>
                <h3 className="event-title">{e.title}</h3>
                <p className="event-description">{e.description}</p>
                <dl className="event-facts">
                  <div>
                    <dt>When</dt>
                    <dd>
                      <time dateTime={e.startsAt}>{formatEventDate(e.startsAt)}</time>
                    </dd>
                  </div>
                  <div>
                    <dt>Where</dt>
                    <dd>{e.location}</dd>
                  </div>
                </dl>
              </div>

              <div className="event-action">
                <p className="event-price">{formatPrice(e.priceCents)}</p>
                {/* When sold out, the button itself says "Sold out", so skip the seat line. */}
                {!e.soldOut && <p className="event-seats">{formatSeats(e.seatsRemaining)}</p>}
                {e.soldOut ? (
                  <button type="button" className="button button-sold-out" disabled>
                    Sold out
                  </button>
                ) : (
                  <BuyButton />
                )}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
