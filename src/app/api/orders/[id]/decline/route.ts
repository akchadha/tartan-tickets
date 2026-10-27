import { getTicketing } from "@/lib/orders/service";
import { respond, type IdContext } from "@/lib/orders/http";

export const dynamic = "force-dynamic";

/** POST /api/orders/{id}/decline: the "Simulate declined payment" button. Releases the seats. */
export async function POST(_request: Request, { params }: IdContext): Promise<Response> {
  const { id } = await params;
  return respond(getTicketing().decline(id));
}
