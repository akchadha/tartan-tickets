import { randomBytes, randomUUID } from "node:crypto";
import type { EventRecord } from "@/lib/events/types";
import type { OrderStatus, OrderView, Result, Ticket } from "./types";

export const MAX_SEATS_PER_ORDER = 4; // Story 3, AC1
export const HOLD_MINUTES = 10; // Story 3, AC2
export const MAX_NAME_LENGTH = 80; // assumption 6

/** Everything the browser sends. All of it is untrusted and checked here, on the server. */
export interface CheckoutInput {
  eventId?: unknown;
  buyerName?: unknown;
  seats?: unknown;
  [other: string]: unknown; // anything else (e.g. a price) is ignored (SEC-8)
}

export interface Ticketing {
  /** Events with seats sold, held, and paid in this server's memory folded into seatsSold. */
  liveEvents(): EventRecord[];
  startCheckout(input: CheckoutInput): Result<OrderView>;
  pay(orderId: string): Result<OrderView>;
  decline(orderId: string): Result<OrderView>;
  getOrder(orderId: string): Result<OrderView>;
}

interface Order {
  orderId: string;
  eventId: string;
  buyerName: string;
  seats: number;
  unitPriceCents: number;
  status: OrderStatus;
  holdExpiresAt: number;
  tickets: Ticket[];
}

const fail = (status: 400 | 401 | 404 | 409, code: string, message: string) =>
  ({ ok: false, status, code, message }) as const;

/**
 * Story 3: buying tickets. Data lives in this object only (HW3 scope: no database).
 * Every method runs start to finish without pausing, so two requests can never both
 * take the last seat on the same server (requirements §8).
 */
export function createTicketing(opts: { events: EventRecord[]; now?: () => Date }): Ticketing {
  const now = () => (opts.now ?? (() => new Date()))().getTime();
  const events = new Map(opts.events.map((e) => [e.eventId, { ...e }]));
  const orders = new Map<string, Order>();

  /** A hold whose 10 minutes have passed is expired, checked every time it matters. */
  function refresh(o: Order): Order {
    if (o.status === "held" && now() >= o.holdExpiresAt) o.status = "expired";
    return o;
  }

  function seatsTaken(eventId: string): number {
    let taken = 0;
    for (const o of orders.values()) {
      refresh(o);
      if (o.eventId === eventId && (o.status === "held" || o.status === "paid")) taken += o.seats;
    }
    return taken;
  }

  function view(o: Order): OrderView {
    return {
      orderId: o.orderId,
      eventId: o.eventId,
      eventTitle: events.get(o.eventId)?.title ?? "",
      buyerName: o.buyerName,
      seats: o.seats,
      unitPriceCents: o.unitPriceCents,
      totalCents: o.unitPriceCents * o.seats,
      status: o.status,
      holdExpiresAt: new Date(o.holdExpiresAt).toISOString(),
      tickets: o.tickets.map((t) => ({ ...t })),
    };
  }

  function find(orderId: string): Order | undefined {
    const o = orders.get(orderId);
    return o && refresh(o);
  }

  return {
    liveEvents() {
      return [...events.values()].map((e) => ({ ...e, seatsSold: e.seatsSold + seatsTaken(e.eventId) }));
    },

    startCheckout(input) {
      // Name stands in for sign-in under the HW3 scope, so a missing one is "not signed in" (401).
      const name = typeof input.buyerName === "string" ? input.buyerName.trim() : "";
      if (!name) return fail(401, "name_required", "Type your name to buy tickets.");
      if (name.length > MAX_NAME_LENGTH)
        return fail(400, "name_too_long", `Names can be at most ${MAX_NAME_LENGTH} characters.`);

      const seats = input.seats;
      if (typeof seats !== "number" || !Number.isInteger(seats) || seats < 1)
        return fail(400, "invalid_seats", "Choose a whole number of seats, from 1 to 4.");
      if (seats > MAX_SEATS_PER_ORDER)
        return fail(400, "too_many_seats", `You can buy at most ${MAX_SEATS_PER_ORDER} seats per order.`);

      const event = typeof input.eventId === "string" ? events.get(input.eventId) : undefined;
      if (!event) return fail(404, "event_not_found", "That event doesn't exist.");
      if (event.status !== "published" || Date.parse(event.startsAt) <= now())
        return fail(409, "not_on_sale", "Tickets for this event aren't on sale.");

      const remaining = Math.max(0, event.capacity - event.seatsSold - seatsTaken(event.eventId));
      if (remaining === 0)
        return fail(409, "sold_out", "Sold out while you were checking out. The waitlist opens in a later update.");
      if (seats > remaining)
        return fail(409, "not_enough_seats", `Only ${remaining} ${remaining === 1 ? "seat" : "seats"} left. Choose fewer seats.`);

      const order: Order = {
        orderId: randomUUID(),
        eventId: event.eventId,
        buyerName: name,
        seats,
        unitPriceCents: event.priceCents, // SEC-8: the stored price, never one sent by the browser
        status: "held",
        holdExpiresAt: now() + HOLD_MINUTES * 60_000,
        tickets: [],
      };
      orders.set(order.orderId, order);
      return { ok: true, value: view(order) };
    },

    pay(orderId) {
      const o = find(orderId);
      if (!o) return fail(404, "order_not_found", "That order doesn't exist.");
      if (o.status === "paid") return fail(409, "already_paid", "This order is already paid.");
      if (o.status === "expired")
        return fail(409, "hold_expired", "Your 10-minute hold ran out and the seats were released. Please start again.");
      if (o.status !== "held") return fail(409, "not_held", "This order is no longer waiting for payment. Please start again.");
      o.status = "paid";
      // SEC-13: 16 random bytes (128 bits) per ticket, no personal data in the code.
      o.tickets = Array.from({ length: o.seats }, () => ({
        ticketId: randomUUID(),
        qrToken: randomBytes(16).toString("base64url"),
      }));
      return { ok: true, value: view(o) };
    },

    decline(orderId) {
      const o = find(orderId);
      if (!o) return fail(404, "order_not_found", "That order doesn't exist.");
      if (o.status !== "held") return fail(409, "not_held", "This order is no longer waiting for payment.");
      o.status = "released";
      return { ok: true, value: view(o) };
    },

    getOrder(orderId) {
      const o = find(orderId);
      return o ? { ok: true, value: view(o) } : fail(404, "order_not_found", "That order doesn't exist.");
    },
  };
}
