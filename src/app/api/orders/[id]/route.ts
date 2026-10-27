import { getTicketing } from "@/lib/orders/service";
import { respond, type IdContext } from "@/lib/orders/http";

export const dynamic = "force-dynamic";

/** GET /api/orders/{id}: look up an order. Order ids are random and unguessable. */
export async function GET(_request: Request, { params }: IdContext): Promise<Response> {
  const { id } = await params;
  return respond(getTicketing().getOrder(id));
}
