import type { EventRecord } from "./types";
import { EVENT_TIME_ZONE } from "./format";

/**
 * Invented sample events (assumption #10). Dates are relative to when the
 * server starts, so the list never goes stale.
 */
export function buildSeedEvents(now: Date): EventRecord[] {
  const at = (days: number, hour: number, minute = 0) => pittsburghTime(now, days, hour, minute);
  const soon = new Date(Math.ceil((now.getTime() + 5 * 3600_000) / 3600_000) * 3600_000).toISOString();

  return [
    {
      eventId: "evt_ramen",
      clubName: "Noodle Society",
      title: "Late-Night Ramen Social",
      description: "Bowls, broth, and board games. Vegetarian broth available.",
      startsAt: soon,
      location: "Cohon Center, Danforth Lounge",
      priceCents: 500,
      capacity: 40,
      seatsSold: 31,
      status: "published",
    },
    {
      eventId: "evt_ceilidh",
      clubName: "Highland Dance Club",
      title: "Fall Ceilidh",
      description: "Scottish country dancing with a live band. Every dance is taught first.",
      startsAt: at(3, 19),
      location: "Cohon Center, Rangos Ballroom",
      priceCents: 1200,
      capacity: 120,
      seatsSold: 120,
      status: "published",
    },
    {
      eventId: "evt_robots",
      clubName: "Mech Arena Club",
      title: "Robot Battle Night",
      description: "Twelve student-built robots, one arena. Safety glasses provided.",
      startsAt: at(6, 18, 30),
      location: "Wiegand Gym",
      priceCents: 0,
      capacity: 200,
      seatsSold: 57,
      status: "published",
    },
    {
      eventId: "evt_openmic",
      clubName: "Acoustic Collective",
      title: "Open Mic in the Underground",
      description: "Sign up at the door to play, or just come to listen.",
      startsAt: at(10, 20),
      location: "The Underground",
      priceCents: 300,
      capacity: 60,
      seatsSold: 59,
      status: "published",
    },
    {
      eventId: "evt_boardgames",
      clubName: "Tabletop Guild",
      title: "Board Game Marathon",
      description: "Twelve hours of games, from quick card games to long campaigns.",
      startsAt: at(14, 10),
      location: "Gates Hillman Center, 6115",
      priceCents: 0,
      capacity: 30,
      seatsSold: 30,
      status: "published",
    },
    {
      eventId: "evt_formal",
      clubName: "Ballroom Dance Club",
      title: "Winter Formal",
      description: "Waltz, swing, and salsa. A beginner lesson starts at 7:30.",
      startsAt: at(45, 19, 30),
      location: "Cohon Center, Rangos Ballroom",
      priceCents: 2500,
      capacity: 300,
      seatsSold: 112,
      status: "published",
    },
    // The three below exist in memory but must NOT appear on the browse page.
    {
      eventId: "evt_pumpkins",
      clubName: "Art Collective",
      title: "Pumpkin Carving (already started)",
      description: "Started two hours ago.",
      startsAt: new Date(now.getTime() - 2 * 3600_000).toISOString(),
      location: "Doherty Hall Lawn",
      priceCents: 400,
      capacity: 50,
      seatsSold: 20,
      status: "published",
    },
    {
      eventId: "evt_stars",
      clubName: "Astronomy Club",
      title: "Stargazing Night (cancelled)",
      description: "Cancelled because of the forecast.",
      startsAt: at(5, 21),
      location: "The Cut",
      priceCents: 0,
      capacity: 80,
      seatsSold: 12,
      status: "cancelled",
    },
    {
      eventId: "evt_showcase",
      clubName: "Dance Collective",
      title: "Spring Showcase (draft)",
      description: "Not published yet.",
      startsAt: at(120, 19),
      location: "Purnell Center",
      priceCents: 1000,
      capacity: 400,
      seatsSold: 0,
      status: "draft",
    },
  ];
}

/** ISO time for "N days from now, at hour:minute Pittsburgh time" (handles daylight saving). */
function pittsburghTime(now: Date, days: number, hour: number, minute: number): string {
  const target = new Date(now.getTime() + days * 86_400_000);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(target);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const wallClockAsUtc = Date.UTC(get("year"), get("month") - 1, get("day"), hour, minute);
  let utc = wallClockAsUtc - offsetMinutes(new Date(wallClockAsUtc)) * 60_000;
  utc = wallClockAsUtc - offsetMinutes(new Date(utc)) * 60_000; // re-check near DST switches
  return new Date(utc).toISOString();
}

/** Pittsburgh's offset from UTC in minutes at a given moment, e.g. -240 in summer. */
function offsetMinutes(at: Date): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: EVENT_TIME_ZONE, timeZoneName: "longOffset" })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName")!.value; // "GMT-04:00"
  const m = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3]));
}
