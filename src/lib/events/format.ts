export const EVENT_TIME_ZONE = "America/New_York"; // Pittsburgh (assumption #9)

const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatPrice(priceCents: number): string {
  return priceCents === 0 ? "Free" : dollars.format(priceCents / 100);
}

const datePart = new Intl.DateTimeFormat("en-US", {
  timeZone: EVENT_TIME_ZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
});
const timePart = new Intl.DateTimeFormat("en-US", {
  timeZone: EVENT_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

/** e.g. "Fri, Oct 16, 7:00 PM" in Pittsburgh time. */
export function formatEventDate(isoUtc: string): string {
  const d = new Date(isoUtc);
  // Some Node versions put a narrow no-break space before AM/PM; normalise to a plain space.
  const time = timePart.format(d).replace(/\u202f/g, " ");
  return `${datePart.format(d)}, ${time}`;
}

export function formatSeats(seatsRemaining: number): string {
  if (seatsRemaining <= 0) return "Sold out";
  return seatsRemaining === 1 ? "1 seat left" : `${seatsRemaining} seats left`;
}

/** e.g. "7:42 PM" in Pittsburgh time. */
export function formatTime(isoUtc: string): string {
  return timePart.format(new Date(isoUtc)).replace(/\u202f/g, " ");
}
