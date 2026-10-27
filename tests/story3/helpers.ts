import { createTicketing } from "@/lib/orders/ticketing";
import { listUpcomingEvents } from "@/lib/events/upcoming";
import type { EventRecord } from "@/lib/events/types";
import { makeEvent, NOW } from "../helpers";

/** A clock the test can move forward, so 10-minute holds can be tested instantly. */
export function makeClock(start: Date = NOW) {
  let t = start.getTime();
  return {
    now: () => new Date(t),
    advanceMinutes: (m: number) => {
      t += m * 60_000;
    },
    advanceSeconds: (s: number) => {
      t += s * 1000;
    },
  };
}

export function setup(overrides: Partial<EventRecord> = {}) {
  const clock = makeClock();
  const event = makeEvent({ eventId: "evt_test", capacity: 10, seatsSold: 0, priceCents: 1200, ...overrides });
  const t = createTicketing({ events: [event], now: clock.now });
  const seatsLeft = () => listUpcomingEvents(t.liveEvents(), clock.now())[0]?.seatsRemaining;
  const buy = (seats: unknown, buyerName: unknown = "Ada") => t.startCheckout({ eventId: "evt_test", buyerName, seats });
  return { t, clock, event, seatsLeft, buy };
}
