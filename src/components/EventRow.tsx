"use client";

import { useId, useState } from "react";
import type { EventListing } from "@/lib/events/types";
import type { CheckoutApi } from "@/lib/orders/client";
import { EVENT_TIME_ZONE, formatEventDate, formatPrice, formatSeats } from "@/lib/events/format";
import { CheckoutPanel } from "./CheckoutPanel";

const monthFmt = new Intl.DateTimeFormat("en-US", { timeZone: EVENT_TIME_ZONE, month: "short" });
const dayFmt = new Intl.DateTimeFormat("en-US", { timeZone: EVENT_TIME_ZONE, day: "numeric" });

/** One event in the list (Story 1) with its Buy tickets checkout (Story 3). */
export function EventRow({ event: e, api }: { event: EventListing; api?: CheckoutApi }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const start = new Date(e.startsAt);

  return (
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
          <button
            type="button"
            className="button button-primary"
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            onClick={() => setOpen((v) => !v)}
          >
            Buy tickets
          </button>
        )}
      </div>

      {open && !e.soldOut && <CheckoutPanel id={panelId} event={e} api={api} onClose={() => setOpen(false)} />}
    </article>
  );
}
