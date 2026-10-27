// Story 3 on screen: the checkout a student actually clicks through, plus UX §6 (Buy disabled after one click).
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventList } from "@/components/EventList";
import type { ApiResult, CheckoutApi } from "@/lib/orders/client";
import type { OrderView } from "@/lib/orders/types";
import { makeListing } from "../helpers";

function order(overrides: Partial<OrderView> = {}): OrderView {
  return {
    orderId: "ord_1",
    eventId: "evt_listing",
    eventTitle: "Fall Ceilidh",
    buyerName: "Ada",
    seats: 2,
    unitPriceCents: 1200,
    totalCents: 2400,
    status: "held",
    holdExpiresAt: "2026-10-01T16:10:00Z", // 12:10 PM Pittsburgh
    tickets: [],
    ...overrides,
  };
}
const ok = (o: OrderView): Promise<ApiResult> => Promise.resolve({ ok: true, order: o });
const fail = (status: number, code: string, message: string): Promise<ApiResult> =>
  Promise.resolve({ ok: false, status, code, message });

function fakeApi(overrides: Partial<CheckoutApi> = {}): CheckoutApi {
  return {
    startCheckout: vi.fn(() => ok(order())),
    pay: vi.fn(() =>
      ok(order({ status: "paid", tickets: [{ ticketId: "t1", qrToken: "tokA" }, { ticketId: "t2", qrToken: "tokB" }] })),
    ),
    decline: vi.fn(() => ok(order({ status: "released" }))),
    ...overrides,
  };
}

async function openCheckout(api: CheckoutApi, listing = makeListing()) {
  render(<EventList events={[listing]} api={api} />);
  await userEvent.click(screen.getByRole("button", { name: "Buy tickets" }));
}
async function holdSeats(name = "Ada", seats = "2") {
  if (name) await userEvent.type(screen.getByRole("textbox", { name: "Your name" }), name);
  await userEvent.selectOptions(screen.getByRole("combobox", { name: "Seats" }), seats);
  await userEvent.click(screen.getByRole("button", { name: "Hold seats" }));
}

describe("S3 checkout on screen", () => {
  it("S3 clicking Buy tickets opens a checkout form with the name box focused", async () => {
    await openCheckout(fakeApi());
    expect(screen.getByRole("textbox", { name: "Your name" })).toHaveFocus();
    expect(screen.getByRole("textbox", { name: "Your name" })).toHaveAttribute("maxLength", "80");
  });

  it("S3-AC1 the seat picker offers at most 4 seats", async () => {
    await openCheckout(fakeApi(), makeListing({ seatsRemaining: 9 }));
    const options = within(screen.getByRole("combobox", { name: "Seats" })).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["1", "2", "3", "4"]);
  });

  it("S3-AC1 the seat picker never offers more seats than are left", async () => {
    await openCheckout(fakeApi(), makeListing({ seatsRemaining: 2 }));
    const options = within(screen.getByRole("combobox", { name: "Seats" })).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["1", "2"]);
  });

  it("S3 a blank name is caught before anything is sent", async () => {
    const api = fakeApi();
    await openCheckout(api);
    await holdSeats("");
    expect(screen.getByRole("alert")).toHaveTextContent("Type your name to buy tickets.");
    expect(api.startCheckout).not.toHaveBeenCalled();
  });

  it("S3 UX§6 double-clicking Hold seats creates only one hold", async () => {
    let finish: (r: ApiResult) => void = () => {};
    const api = fakeApi({ startCheckout: vi.fn(() => new Promise<ApiResult>((res) => (finish = res))) });
    await openCheckout(api);
    await userEvent.type(screen.getByRole("textbox", { name: "Your name" }), "Ada");
    await userEvent.dblClick(screen.getByRole("button", { name: "Hold seats" }));
    expect(api.startCheckout).toHaveBeenCalledTimes(1);
    finish({ ok: true, order: order() });
  });

  it("S3-AC2 after holding, shows when the hold ends and the server's total", async () => {
    const api = fakeApi();
    await openCheckout(api);
    await holdSeats("Ada", "2");
    expect(api.startCheckout).toHaveBeenCalledWith({ eventId: "evt_listing", buyerName: "Ada", seats: 2 });
    expect(await screen.findByText(/Seats held until 12:10 PM/)).toBeInTheDocument();
    expect(screen.getByText("$24.00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simulated payment" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Simulate declined payment" })).toBeEnabled();
  });

  it("S3-AC3 simulated payment shows a receipt with one QR code per ticket", async () => {
    await openCheckout(fakeApi());
    await holdSeats();
    await userEvent.click(await screen.findByRole("button", { name: "Simulated payment" }));
    expect(await screen.findByRole("heading", { name: "You're going!" })).toBeInTheDocument();
    const qrs = await screen.findAllByRole("img", { name: /QR code for ticket \d of 2/ });
    expect(qrs).toHaveLength(2);
    expect(qrs[0].getAttribute("src")).toMatch(/^data:image\/svg\+xml/);
  });

  it("S3-AC4 a declined payment tells the student the seats were released", async () => {
    await openCheckout(fakeApi());
    await holdSeats();
    await userEvent.click(await screen.findByRole("button", { name: "Simulate declined payment" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Payment declined. Your 2 seats were released.");
  });

  it("S3-AC2 paying after the hold ran out shows the server's explanation", async () => {
    const api = fakeApi({ pay: vi.fn(() => fail(409, "hold_expired", "Your 10-minute hold ran out.")) });
    await openCheckout(api);
    await holdSeats();
    await userEvent.click(await screen.findByRole("button", { name: "Simulated payment" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Your 10-minute hold ran out.");
  });

  it("S3-AC5 selling out during checkout shows the waitlist message", async () => {
    const msg = "Sold out while you were checking out. The waitlist opens in a later update.";
    await openCheckout(fakeApi({ startCheckout: vi.fn(() => fail(409, "sold_out", msg)) }));
    await holdSeats();
    expect(await screen.findByRole("alert")).toHaveTextContent(msg);
  });

  it("S3 SEC-20 a typed name is shown as plain text on the receipt", async () => {
    const evil = "<b>hello</b>";
    const api = fakeApi({
      pay: vi.fn(() => ok(order({ status: "paid", buyerName: evil, tickets: [{ ticketId: "t1", qrToken: "tokA" }] }))),
    });
    const { container } = render(<EventList events={[makeListing()]} api={api} />);
    await userEvent.click(screen.getByRole("button", { name: "Buy tickets" }));
    await holdSeats(evil);
    await userEvent.click(await screen.findByRole("button", { name: "Simulated payment" }));
    expect(await screen.findByText(evil, { exact: false })).toBeInTheDocument();
    expect(container.querySelector("b")).toBeNull();
  });
});
