# Tartan Tickets: Story 1 (Browse events)

Students can see upcoming club events with the date, location, price, and seats left.
Sold-out events show a disabled **Sold out** button instead of **Buy tickets**.

## Run it on your computer

You need **Node.js 20.9 or newer** (download the "LTS" version from nodejs.org).

```bash
npm install      # once, downloads the libraries
npm run dev      # starts the app at http://localhost:3000
```

Other commands:

| Command | What it does |
|---|---|
| `npm test` | Runs all automated tests |
| `npm run build` | Builds the production version (what Vercel runs) |
| `npm start` | Runs the production version locally (after `npm run build`) |
| `npm run lint` | Checks the code for common mistakes |

## What is and isn't real yet

- **Events are sample data kept in server memory** (`src/lib/events/seed.ts`). Restarting the
  app resets them. Their dates are set relative to when the app starts, so they never go stale.
- **Buy tickets is a placeholder.** It shows a message; checkout comes with Story 3.
- **No sign-in and no payments yet.** Browsing is public.
- **Before Story 3 we need a real database.** On Vercel, each server copy has its own memory,
  so seat counts would disagree between copies and events could be oversold. Storage sits behind
  one interface (`src/lib/events/store.ts`), so it can be swapped without touching the page.

## Assumptions used (from the questions asked before building)

1. Sold out shows a disabled "Sold out" button; the waitlist is deferred to Story 4.
2. `requirements.md` is the source of truth; Story 1's rules are numbered S1-AC1 and S1-AC2.
3. "Upcoming" = published and not yet started. Cancelled, draft, and started events are hidden.
4. Soonest first.
5. The hosting club's name is shown.
6. Prices show as "$12.00"; $0 shows as "Free".
7. Exact seat counts ("23 seats left", "1 seat left").
8. Browsing needs no sign-in.
9. Pittsburgh time, e.g. "Fri, Oct 16, 7:00 PM".
10. Six invented sample events, plus three hidden ones (started, cancelled, draft) to prove filtering.
11. CMU-inspired red, no CMU logo.

## Requirement → test map

| Rule | Test file (`tests/story1/`) |
|---|---|
| S1-AC1: list upcoming events with date, location, price, seats | `S1-AC1.upcoming.test.ts`, `S1-AC1.format.test.ts`, `S1-AC1.event-list.test.tsx`, `S1-AC1.page.test.tsx`, `S1-AC1.api.test.ts` |
| S1-AC2: sold out shows a different button instead of Buy | `S1-AC2.sold-out.test.tsx` |
| UX §6: empty, loading, error states | `S1-ux-states.test.tsx` |
| UX §6: contrast ≥ 4.5:1, keyboard use | `S1-a11y.test.ts`, keyboard test in `S1-AC2.sold-out.test.tsx` |
| SEC-20: officer text shown as plain text | `S1-AC1.event-list.test.tsx` |
| API §5: `GET /api/events` → 200 | `S1-AC1.api.test.ts` |
