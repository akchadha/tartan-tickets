// UX spec §6: every screen defines empty, loading, error, and success states.
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventList } from "@/components/EventList";
import Loading from "@/app/loading";
import ErrorPage from "@/app/error";

describe("S1 screen states", () => {
  it("S1 empty state reads 'No upcoming events yet.'", () => {
    render(<EventList events={[]} />);
    expect(screen.getByText("No upcoming events yet.")).toBeInTheDocument();
    expect(screen.queryByRole("article")).toBeNull();
  });

  it("S1 loading state is announced to screen readers", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading events");
  });

  it("S1 error state explains the problem and offers a retry", async () => {
    const reset = vi.fn();
    render(<ErrorPage error={new Error("boom")} reset={reset} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Events couldn't be loaded.");
    expect(screen.queryByText("boom")).toBeNull(); // internal details never shown
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
