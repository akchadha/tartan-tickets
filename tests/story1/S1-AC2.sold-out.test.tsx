// Story 1, AC2: WHILE an event is sold out, THE system SHALL show a different
// button instead of "Buy".  Per assumption #1 that button is a disabled "Sold out"
// (the waitlist arrives with Story 4).
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventList } from "@/components/EventList";
import { makeListing } from "../helpers";

const available = makeListing({ eventId: "open", title: "Open Mic" });
const soldOut = makeListing({ eventId: "full", title: "Fall Ceilidh", seatsRemaining: 0, soldOut: true });

describe("S1-AC2 sold-out events", () => {
  it("S1-AC2 replaces Buy with a disabled Sold out button", () => {
    render(<EventList events={[soldOut]} />);
    const item = within(screen.getByRole("article", { name: "Fall Ceilidh" }));
    expect(item.queryByRole("button", { name: /buy/i })).toBeNull();
    expect(item.getByRole("button", { name: "Sold out" })).toBeDisabled();
  });

  it("S1-AC2 says Sold out once per event, not twice", () => {
    render(<EventList events={[soldOut]} />);
    const item = within(screen.getByRole("article", { name: "Fall Ceilidh" }));
    expect(item.getAllByText("Sold out")).toHaveLength(1);
  });

  it("S1-AC2 still shows an enabled Buy button for events with seats", () => {
    render(<EventList events={[available, soldOut]} />);
    const item = within(screen.getByRole("article", { name: "Open Mic" }));
    expect(item.getByRole("button", { name: "Buy tickets" })).toBeEnabled();
    expect(item.queryByRole("button", { name: "Sold out" })).toBeNull();
  });

  it("S1-AC2 does not offer a waitlist yet (Story 4)", () => {
    render(<EventList events={[soldOut]} />);
    expect(screen.getByRole("article", { name: "Fall Ceilidh" })).toBeInTheDocument();
    expect(screen.queryByText(/waitlist/i)).toBeNull();
  });
});

describe("S1 scope: Buy is a placeholder until Story 3", () => {
  it("S1 clicking Buy tells the student checkout is not available yet", async () => {
    render(<EventList events={[available]} />);
    await userEvent.click(screen.getByRole("button", { name: "Buy tickets" }));
    expect(screen.getByRole("status")).toHaveTextContent("Checkout isn't open yet. Ticket sales arrive in the next update.");
  });

  it("S1 the Buy button is reachable with the keyboard alone", async () => {
    render(<EventList events={[available]} />);
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Buy tickets" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent(/isn't open yet/);
  });
});
