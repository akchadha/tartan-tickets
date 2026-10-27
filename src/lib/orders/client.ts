import type { OrderView } from "./types";

export type ApiResult = { ok: true; order: OrderView } | { ok: false; status: number; code: string; message: string };

/** How the checkout screen talks to the server. Tests swap in a fake. */
export interface CheckoutApi {
  startCheckout(input: { eventId: string; buyerName: string; seats: number }): Promise<ApiResult>;
  pay(orderId: string): Promise<ApiResult>;
  decline(orderId: string): Promise<ApiResult>;
}

async function call(url: string, body?: unknown): Promise<ApiResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.order) return { ok: true, order: data.order as OrderView };
    return {
      ok: false,
      status: res.status,
      code: data?.error?.code ?? "error",
      message: data?.error?.message ?? "Something went wrong. Please try again.",
    };
  } catch {
    return { ok: false, status: 0, code: "network", message: "Couldn't reach the server. Check your connection and try again." };
  }
}

export const fetchCheckoutApi: CheckoutApi = {
  startCheckout: (input) => call("/api/orders", input),
  pay: (orderId) => call(`/api/orders/${encodeURIComponent(orderId)}/pay`),
  decline: (orderId) => call(`/api/orders/${encodeURIComponent(orderId)}/decline`),
};
