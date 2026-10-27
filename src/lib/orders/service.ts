import { buildSeedEvents } from "@/lib/events/seed";
import { createTicketing, type Ticketing } from "./ticketing";

/**
 * The app-wide ticketing state, kept in this server's memory (HW3 scope: no database).
 *
 * Stored on globalThis, not in a module variable: Next.js bundles the page and each API route
 * separately, and a module variable would give each bundle its own copy of the orders.
 * globalThis is shared by every bundle in the same server process.
 *
 * Limits (see README): it resets on every deploy and restart, and on Vercel several server
 * processes can run at once, each with its own memory, so counts can still disagree there.
 */
const KEY = Symbol.for("tartan-tickets.ticketing");
type Holder = { [KEY]?: Ticketing };

export function getTicketing(): Ticketing {
  const g = globalThis as Holder;
  g[KEY] ??= createTicketing({ events: buildSeedEvents(new Date()) });
  return g[KEY];
}

/** Tests only: swap in a fresh ticketing state, or pass undefined to go back to the sample data. */
export function setTicketingForTests(t: Ticketing | undefined): void {
  (globalThis as Holder)[KEY] = t;
}
