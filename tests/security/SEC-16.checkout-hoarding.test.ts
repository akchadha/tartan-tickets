// SEC-16: IF a single account starts more than 5 checkouts for one event within 10 minutes,
// THEN the system SHALL block further checkouts for that account for 30 minutes.
// Under the HW3 scope there is no sign-in, so the "account" is the typed name.
import { afterEach, describe, expect, it } from "vitest";
import { createTicketing } from "@/lib/orders/ticketing";
import { setTicketingForTests } from "@/lib/orders/service";
import { POST as createOrder } from "@/app/api/orders/route";
import { makeEvent } from "../helpers";
import { makeClock } from "../story3/helpers";

function setup() {
  const clock = makeClock();
  const events = [
    makeEvent({ eventId: "evt_a", capacity: 500, seatsSold: 0 }),
    makeEvent({ eventId: "evt_b", capacity: 500, seatsSold: 0 }),
  ];
  const t = createTicketing({ events, now: clock.now });
  const start = (buyerName: string, eventId = "evt_a") => t.startCheckout({ eventId, buyerName, seats: 1 });
  return { t, clock, start };
}

describe("SEC-16 checkout hoarding limit", () => {
  it("a student who starts a sixth checkout for the same event within ten minutes is refused and blocked for thirty minutes", () => {
    const { clock, start } = setup();
    for (let i = 0; i < 5; i++) {
      expect(start("Hoarder").ok).toBe(true);
      clock.advanceMinutes(1);
    }
    expect(start("Hoarder")).toMatchObject({ ok: false, status: 429, code: "too_many_checkouts" });

    clock.advanceMinutes(29); // 29 minutes into the block: still refused, on any event
    expect(start("Hoarder", "evt_b")).toMatchObject({ ok: false, status: 429 });

    clock.advanceMinutes(1); // 30 minutes after the block began: allowed again
    expect(start("Hoarder").ok).toBe(true);
  });

  it("five checkouts spread over more than ten minutes are not blocked", () => {
    const { clock, start } = setup();
    for (let i = 0; i < 5; i++) expect(start("Ada").ok).toBe(true);
    clock.advanceMinutes(10);
    expect(start("Ada").ok).toBe(true);
  });

  it("changing the capitals or adding spaces to the name does not get around the block", () => {
    const { start } = setup();
    for (let i = 0; i < 5; i++) expect(start("Ada Lovelace").ok).toBe(true);
    expect(start("  ada   LOVELACE ")).toMatchObject({ ok: false, status: 429 });
  });

  it("one student being blocked does not affect anyone else", () => {
    const { start } = setup();
    for (let i = 0; i < 6; i++) start("Hoarder");
    expect(start("Ben").ok).toBe(true);
  });

  it("checkouts for different events are counted separately", () => {
    const { start } = setup();
    for (let i = 0; i < 5; i++) expect(start("Ada", "evt_a").ok).toBe(true);
    for (let i = 0; i < 5; i++) expect(start("Ada", "evt_b").ok).toBe(true);
  });
});

describe("SEC-16 through the orders API", () => {
  afterEach(() => setTicketingForTests(undefined));

  it("the orders API answers a blocked student with status 429 and says when to try again", async () => {
    const event = makeEvent({ eventId: "evt_api", capacity: 500, seatsSold: 0, startsAt: "2099-01-01T00:00:00Z" });
    setTicketingForTests(createTicketing({ events: [event] }));
    const post = () =>
      createOrder(
        new Request("http://test/api/orders", {
          method: "POST",
          body: JSON.stringify({ eventId: "evt_api", buyerName: "Hoarder", seats: 1 }),
        }),
      );
    for (let i = 0; i < 5; i++) expect((await post()).status).toBe(201);
    const blocked = await post();
    expect(blocked.status).toBe(429);
    expect((await blocked.json()).error.message).toMatch(/try again at \d{1,2}:\d{2} (AM|PM)/i);
  });
});
