// @vitest-environment node
// Bug found in the live check: in the production build, the page and each API route are bundled
// separately, so each got its own copy of the in-memory orders. A purchase made through
// /api/orders did not lower "seats left" on the page. Loading the module twice simulates that.
import { describe, expect, it, vi } from "vitest";

describe("S3 shared in-memory state", () => {
  it("S3-AC2 the page and every API route see the same seat counts", async () => {
    vi.resetModules();
    const routeCopy = await import("@/lib/orders/service");
    vi.resetModules();
    const pageCopy = await import("@/lib/orders/service");
    expect(pageCopy).not.toBe(routeCopy); // two separately loaded copies, like two bundles

    const robots = (t: ReturnType<typeof pageCopy.getTicketing>) =>
      t.liveEvents().find((e) => e.eventId === "evt_robots")!.seatsSold;
    const before = robots(pageCopy.getTicketing());
    const r = routeCopy.getTicketing().startCheckout({ eventId: "evt_robots", buyerName: "Ada", seats: 2 });
    expect(r.ok).toBe(true);
    expect(robots(pageCopy.getTicketing())).toBe(before + 2);
  });
});
