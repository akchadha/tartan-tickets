// Story 1, AC1 rendered on screen, plus SEC-20 (officer text shown as plain text).
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { EventList } from "@/components/EventList";
import { makeListing } from "../helpers";

describe("S1-AC1 event list on screen", () => {
  it("S1-AC1 shows title, club, date, location, price, and seats remaining for each event", () => {
    render(<EventList events={[makeListing()]} />);
    const item = screen.getByRole("article", { name: "Fall Ceilidh" });
    const scoped = within(item);
    expect(scoped.getByText("Highland Dance Club")).toBeInTheDocument();
    expect(scoped.getByText("Fri, Oct 16, 7:00 PM")).toBeInTheDocument();
    expect(scoped.getByText("Rangos Ballroom")).toBeInTheDocument();
    expect(scoped.getByText("$12.00")).toBeInTheDocument();
    expect(scoped.getByText("23 seats left")).toBeInTheDocument();
  });

  it("S1-AC1 shows every event it is given, in the given order", () => {
    render(
      <EventList
        events={[makeListing({ eventId: "a", title: "First" }), makeListing({ eventId: "b", title: "Second" })]}
      />,
    );
    const titles = screen.getAllByRole("article").map((a) => a.getAttribute("aria-label"));
    expect(titles).toEqual(["First", "Second"]);
  });

  it("S1-AC1 SEC-20 shows officer-entered text as plain text, never as code", () => {
    const evil = '<img src=x onerror="alert(1)"><script>alert(2)</script>';
    const { container } = render(<EventList events={[makeListing({ title: evil, description: evil })]} />);
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getAllByText(evil).length).toBe(2);
  });
});
