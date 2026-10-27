"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import type { EventListing } from "@/lib/events/types";
import type { OrderView } from "@/lib/orders/types";
import { fetchCheckoutApi, type ApiResult, type CheckoutApi } from "@/lib/orders/client";
import { formatPrice, formatTime } from "@/lib/events/format";
import { QrImage } from "./QrImage";

const MAX_SEATS = 4; // Story 3, AC1 (the server enforces this too)
const MAX_NAME = 80;

type Step = { kind: "form" } | { kind: "held"; order: OrderView } | { kind: "paid"; order: OrderView };

/**
 * Story 3: hold seats → Simulated payment → receipt with QR codes.
 * Everything typed here is checked again on the server; the page is only a convenience.
 * All text is rendered by React, which escapes it, so typed names stay plain text (SEC-20).
 */
export function CheckoutPanel({
  event,
  api = fetchCheckoutApi,
  onClose,
  id,
}: {
  event: EventListing;
  api?: CheckoutApi;
  onClose?: () => void;
  id?: string;
}) {
  const nameId = useId();
  const seatsId = useId();
  const [step, setStep] = useState<Step>({ kind: "form" });
  const [name, setName] = useState("");
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false); // blocks a second click before React re-renders (UX §6)

  const maxSeats = Math.max(1, Math.min(MAX_SEATS, event.seatsRemaining));

  async function run(action: () => Promise<ApiResult>, onOk: (o: OrderView) => void) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    const result = await action();
    busyRef.current = false;
    setBusy(false);
    if (result.ok) onOk(result.order);
    else setError(result.message);
  }

  function hold(e: FormEvent) {
    e.preventDefault();
    if (busyRef.current) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Type your name to buy tickets.");
      return;
    }
    void run(
      () => api.startCheckout({ eventId: event.eventId, buyerName: trimmed, seats }),
      (order) => setStep({ kind: "held", order }),
    );
  }

  function startOver() {
    setError("");
    setStep({ kind: "form" });
  }

  return (
    <section className="checkout" id={id} aria-label={`Buy tickets for ${event.title}`}>
      {step.kind === "form" && (
        <form className="checkout-form" onSubmit={hold} noValidate>
          <div className="field">
            <label htmlFor={nameId}>Your name</label>
            <input
              id={nameId}
              type="text"
              value={name}
              maxLength={MAX_NAME}
              autoComplete="name"
              autoFocus
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field field-seats">
            <label htmlFor={seatsId}>Seats</label>
            <select id={seatsId} value={seats} onChange={(e) => setSeats(Number(e.target.value))}>
              {Array.from({ length: maxSeats }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="checkout-actions">
            <button type="submit" className="button button-primary" disabled={busy}>
              Hold seats
            </button>
            <button type="button" className="button button-quiet" onClick={onClose}>
              Cancel
            </button>
          </div>
          <p className="checkout-note">Seats are held for 10 minutes while you pay. Up to 4 per order.</p>
        </form>
      )}

      {step.kind === "held" && (
        <div className="checkout-held">
          <p className="checkout-summary">
            {step.order.seats} {step.order.seats === 1 ? "seat" : "seats"} for {step.order.eventTitle}
            <span className="checkout-total">{formatPrice(step.order.totalCents)}</span>
          </p>
          <p className="checkout-note">
            Seats held until {formatTime(step.order.holdExpiresAt)}. Pay before then or they go back on sale.
          </p>
          <div className="checkout-actions">
            <button
              type="button"
              className="button button-primary"
              disabled={busy}
              onClick={() => run(() => api.pay(step.order.orderId), (order) => setStep({ kind: "paid", order }))}
            >
              Simulated payment
            </button>
            <button
              type="button"
              className="button button-quiet"
              disabled={busy}
              onClick={() =>
                run(
                  () => api.decline(step.order.orderId),
                  (order) => {
                    setStep({ kind: "form" });
                    setError(
                      `Payment declined. Your ${order.seats} ${order.seats === 1 ? "seat was" : "seats were"} released.`,
                    );
                  },
                )
              }
            >
              Simulate declined payment
            </button>
          </div>
          <p className="checkout-note">No real card is charged. This version uses simulated payments only.</p>
        </div>
      )}

      {step.kind === "paid" && (
        <div className="receipt">
          <h4 className="receipt-title">You&apos;re going!</h4>
          <p>
            Receipt for <strong>{step.order.buyerName}</strong>: {step.order.seats}{" "}
            {step.order.seats === 1 ? "ticket" : "tickets"} to {step.order.eventTitle},{" "}
            {formatPrice(step.order.totalCents)}.
          </p>
          <p className="checkout-note">Show a QR code at the door. Save or screenshot this page; email receipts aren&apos;t part of this version.</p>
          <ul className="qr-list">
            {step.order.tickets.map((t, i) => (
              <li key={t.ticketId}>
                <QrImage token={t.qrToken} label={`QR code for ticket ${i + 1} of ${step.order.tickets.length}`} />
                <span className="qr-caption">Ticket {i + 1}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="button button-quiet" onClick={onClose}>
            Done
          </button>
        </div>
      )}

      {error && (
        <div role="alert" className="checkout-error">
          <p>{error}</p>
          {step.kind === "held" && (
            <button type="button" className="button button-quiet" onClick={startOver}>
              Start again
            </button>
          )}
        </div>
      )}
    </section>
  );
}
