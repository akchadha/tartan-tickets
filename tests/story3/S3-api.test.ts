// @vitest-environment node
// API contract (requirements §5), SEC-8 (server computes the price), and §8 concurrency.
import { afterEach, describe, expect, it } from "vitest";
import { POST as createOrder } from "@/app/api/orders/route";
import { GET as getOrder } from "@/app/api/orders/[id]/route";
import { POST as payOrder } from "@/app/api/orders/[id]/pay/route";
import { POST as declineOrder } from "@/app/api/orders/[id]/decline/route";
import { createTicketing } from "@/lib/orders/ticketing";
import { setTicketingForTests } from "@/lib/orders/service";
import { makeEvent } from "../helpers";

function useEvent(overrides = {}) {
  const event = makeEvent({ eventId: "evt_api", capacity: 10, seatsSold: 0, priceCents: 1200, startsAt: "2099-01-01T00:00:00Z", ...overrides });
  setTicketingForTests(createTicketing({ events: [event] }));
}
afterEach(() => setTicketingForTests(undefined));

const post = (body: unknown) =>
  createOrder(new Request("http://test/api/orders", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const req = (method = "POST") => new Request("http://test", { method });

describe("S3 POST /api/orders", () => {
  it("S3-AC2 returns 201 with a held order", async () => {
    useEvent();
    const res = await post({ eventId: "evt_api", buyerName: "Ada", seats: 2 });
    expect(res.status).toBe(201);
    const { order } = await res.json();
    expect(order).toMatchObject({ seats: 2, status: "held", buyerName: "Ada", totalCents: 2400 });
  });

  it("S3-AC1 returns 400 for more than 4 seats", async () => {
    useEvent();
    expect((await post({ eventId: "evt_api", buyerName: "Ada", seats: 5 })).status).toBe(400);
  });

  it("S3 returns 401 when no name is typed, including only spaces", async () => {
    useEvent();
    expect((await post({ eventId: "evt_api", seats: 1 })).status).toBe(401);
    expect((await post({ eventId: "evt_api", buyerName: "   ", seats: 1 })).status).toBe(401);
  });

  it("S3 returns 400 for a name longer than 80 characters", async () => {
    useEvent();
    expect((await post({ eventId: "evt_api", buyerName: "x".repeat(81), seats: 1 })).status).toBe(400);
    expect((await post({ eventId: "evt_api", buyerName: "x".repeat(80), seats: 1 })).status).toBe(201);
  });

  it("S3-AC5 returns 409 when the event is sold out", async () => {
    useEvent({ seatsSold: 10 });
    expect((await post({ eventId: "evt_api", buyerName: "Ada", seats: 1 })).status).toBe(409);
  });

  it("S3 returns 404 for an unknown event and 400 for a malformed body", async () => {
    useEvent();
    expect((await post({ eventId: "nope", buyerName: "Ada", seats: 1 })).status).toBe(404);
    expect((await post("{not json")).status).toBe(400);
  });

  it("S3 SEC-8 ignores any price or total sent by the browser", async () => {
    useEvent();
    const res = await post({ eventId: "evt_api", buyerName: "Ada", seats: 2, priceCents: 1, unitPriceCents: 1, totalCents: 1 });
    const { order } = await res.json();
    expect(order.unitPriceCents).toBe(1200);
    expect(order.totalCents).toBe(2400);
  });

  it("S3 §8 fifty simultaneous buyers for the last seat produce exactly one success", async () => {
    useEvent({ capacity: 10, seatsSold: 9 });
    const results = await Promise.all(
      Array.from({ length: 50 }, (_, i) => post({ eventId: "evt_api", buyerName: `Buyer ${i}`, seats: 1 })),
    );
    const statuses = results.map((r) => r.status);
    expect(statuses.filter((s) => s === 201)).toHaveLength(1);
    expect(statuses.filter((s) => s === 409)).toHaveLength(49);
  });
});

describe("S3 order follow-up routes", () => {
  it("S3-AC3 pay returns 200 with tickets; GET shows the paid order", async () => {
    useEvent();
    const { order } = await (await post({ eventId: "evt_api", buyerName: "Ada", seats: 2 })).json();
    const paid = await payOrder(req(), ctx(order.orderId));
    expect(paid.status).toBe(200);
    expect((await paid.json()).order.tickets).toHaveLength(2);
    const got = await getOrder(req("GET"), ctx(order.orderId));
    expect(got.status).toBe(200);
    expect((await got.json()).order.status).toBe("paid");
  });

  it("S3-AC4 decline returns 200 and releases the seats", async () => {
    useEvent();
    const { order } = await (await post({ eventId: "evt_api", buyerName: "Ada", seats: 2 })).json();
    const res = await declineOrder(req(), ctx(order.orderId));
    expect(res.status).toBe(200);
    expect((await res.json()).order.status).toBe("released");
  });

  it("S3 unknown order ids return 404", async () => {
    useEvent();
    expect((await getOrder(req("GET"), ctx("missing"))).status).toBe(404);
    expect((await payOrder(req(), ctx("missing"))).status).toBe(404);
  });
});
