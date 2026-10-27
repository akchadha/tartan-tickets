import type { OrderView, Result } from "./types";

/** Turns a ticketing result into the HTTP response from the API contract (requirements §5). */
export function respond(result: Result<OrderView>, successStatus = 200): Response {
  if (result.ok) return Response.json({ order: result.value }, { status: successStatus });
  return Response.json({ error: { code: result.code, message: result.message } }, { status: result.status });
}

export type IdContext = { params: Promise<{ id: string }> };
