// Story 1, AC1 end to end on the server: the home page shows the in-memory sample events.
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import { buildSeedEvents } from "@/lib/events/seed";
import { createMemoryStore } from "@/lib/events/store";
import { listUpcomingEvents } from "@/lib/events/upcoming";

describe("S1-AC1 home page", () => {
  it("S1-AC1 lists the sample events, including at least one sold out", async () => {
    render(await HomePage());
    const articles = screen.getAllByRole("article");
    expect(articles.length).toBeGreaterThanOrEqual(5);
    expect(screen.getAllByRole("button", { name: "Sold out" }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: "Buy tickets" }).length).toBeGreaterThanOrEqual(1);
  });

  it("S1-AC1 sample data covers free, sold-out, nearly-full, and hidden events", () => {
    const now = new Date();
    const seed = buildSeedEvents(now);
    const listed = listUpcomingEvents(seed, now);
    expect(listed.some((e) => e.priceCents === 0)).toBe(true);
    expect(listed.some((e) => e.soldOut)).toBe(true);
    expect(listed.some((e) => e.seatsRemaining === 1)).toBe(true);
    expect(seed.length).toBeGreaterThan(listed.length); // past/cancelled/draft exist but are hidden
  });

  it("S1-AC1 the in-memory store returns copies, so callers cannot change stored data", () => {
    const store = createMemoryStore(buildSeedEvents(new Date()));
    store.all()[0].title = "tampered";
    expect(store.all()[0].title).not.toBe("tampered");
  });
});
