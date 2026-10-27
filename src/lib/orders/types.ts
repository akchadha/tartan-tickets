/** Story 3: an order moves held → paid, or held → released (declined) / expired (10 minutes passed). */
export type OrderStatus = "held" | "paid" | "released" | "expired";

export interface Ticket {
  ticketId: string;
  /** Random code shown as a QR image. Contains no personal data (SEC-13). */
  qrToken: string;
}

/** What the server sends to the browser about an order. */
export interface OrderView {
  orderId: string;
  eventId: string;
  eventTitle: string;
  buyerName: string;
  seats: number;
  unitPriceCents: number;
  totalCents: number;
  status: OrderStatus;
  /** ISO time when the 10-minute hold runs out. */
  holdExpiresAt: string;
  /** Empty until the order is paid. */
  tickets: Ticket[];
}

export type ErrorStatus = 400 | 401 | 404 | 409;

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; status: ErrorStatus; code: string; message: string };
