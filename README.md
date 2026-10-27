# Tartan Tickets: Stories 1 and 3 (Browse events, Buy tickets)

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

- **Data lives in server memory and resets on every deploy** (and every restart). Sample events
  are set up in `src/lib/events/seed.ts`, with dates relative to when the server starts.
- **On the live site, seat counts are not guaranteed to be exact.** Vercel can run several copies
  of the server at once, each with its own memory, so two copies can each sell the "last" seat.
  The tests prove there is no overselling on one server; a shared database is needed for the
  live site to guarantee it.
- After buying, the "seats left" number on the list updates when you reload the page.

## Non-goals (HW3 scope)

- **Real payments.** Checkout uses a "Simulated payment" button and a "Simulate declined payment"
  button. No card is ever charged and no payment provider is connected.
- **Real authentication.** The buyer types a name; anyone can type any name. University SSO is not
  connected.
- **Email receipts.** The receipt and QR codes are shown on screen after payment instead of being
  emailed (the spec's "email within 1 minute" needs an email service).
- **Waitlist (Story 4).** Selling out during checkout shows a message that the waitlist opens later.
- Everything in `docs/requirements.md` §2 (resale, seat maps, native app, storing card numbers).

## Story 3 rules as built

- At most 4 seats per order (the server refuses 5+ with a 400), never more than the seats left.
- "Hold seats" reserves seats for exactly 10 minutes; held seats count as taken for everyone.
- "Simulated payment" issues one ticket per seat, each with a random 128-bit QR code containing
  no personal data. Paying twice, or after the hold ran out, is refused.
- "Simulate declined payment" releases the seats at once.
- The server computes the price from its own data and ignores any price the browser sends (SEC-8).
- Names are required and at most 80 characters, checked on the server.

### API

| Method | Endpoint | Success | Errors |
|---|---|---|---|
| GET | /api/events | 200 | — |
| POST | /api/orders | 201 (held) | 400 bad seats/name/body, 401 no name, 404 unknown event, 409 sold out / not enough seats / not on sale |
| GET | /api/orders/{id} | 200 | 404 |
| POST | /api/orders/{id}/pay | 200 (paid, with tickets) | 404, 409 already paid / hold expired / not held |
| POST | /api/orders/{id}/decline | 200 (released) | 404, 409 not held |

## Story 1 assumptions (from the questions asked before building)

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

## Story 3 assumptions (from the B2 plan)

1. The receipt is shown on screen, not emailed. 2. QR codes are drawn with the `qrcode` package.
3. A "Simulate declined payment" button exists so the decline rule can be tested.
4. Sold out during checkout says the waitlist opens later. 5. The 4-seat cap is per order, as the
spec says, so one person can place several orders (open question for the spec).
6. Names are required, trimmed, and at most 80 characters. 7. Held seats count as taken.
8. The checkout shows the time the hold ends.

## Requirement → test map

| Rule | Test file (`tests/story1/`) |
|---|---|
| S1-AC1: list upcoming events with date, location, price, seats | `S1-AC1.upcoming.test.ts`, `S1-AC1.format.test.ts`, `S1-AC1.event-list.test.tsx`, `S1-AC1.page.test.tsx`, `S1-AC1.api.test.ts` |
| S1-AC2: sold out shows a different button instead of Buy | `S1-AC2.sold-out.test.tsx` |
| UX §6: empty, loading, error states | `S1-ux-states.test.tsx` |
| UX §6: contrast ≥ 4.5:1, keyboard use | `S1-a11y.test.ts`, keyboard test in `S1-AC2.sold-out.test.tsx` |
| SEC-20: officer text shown as plain text | `S1-AC1.event-list.test.tsx` |
| API §5: `GET /api/events` → 200 | `S1-AC1.api.test.ts` |
| S3-AC1: cap at 4 seats per order | `tests/story3/S3-AC1.cap.test.ts`, seat-picker tests in `S3-ui.test.tsx`, 400 in `S3-api.test.ts` |
| S3-AC2: hold seats for 10 minutes | `tests/story3/S3-AC2.hold.test.ts`, `S3-shared-state.test.ts`, hold display in `S3-ui.test.tsx` |
| S3-AC3: receipt with QR code on payment | `tests/story3/S3-AC3.payment.test.ts`, receipt test in `S3-ui.test.tsx` |
| S3-AC4: declined card releases seats | `tests/story3/S3-AC4.decline.test.ts`, decline tests in `S3-ui.test.tsx` and `S3-api.test.ts` |
| S3-AC5: sold out during checkout → waitlist | `tests/story3/S3-AC5.sold-out.test.ts`, message test in `S3-ui.test.tsx` |
| API §5, SEC-8 price, §8 concurrency (50 buyers, 1 seat) | `tests/story3/S3-api.test.ts` |
| UX §6: Buy disabled after one click | double-click test in `S3-ui.test.tsx` |

Test runs before and after the Story 3 code are saved in `docs/evidence/`.
