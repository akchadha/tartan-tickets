import { getTicketing } from "@/lib/orders/service";
import { respond } from "@/lib/orders/http";

export const dynamic = "force-dynamic";

/** POST /api/orders: start checkout and hold seats for 10 minutes (Story 3). */
export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { code: "bad_request", message: "The request was not valid." } }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ error: { code: "bad_request", message: "The request was not valid." } }, { status: 400 });
  }
  return respond(getTicketing().startCheckout(body as Record<string, unknown>), 201);
}
