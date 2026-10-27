import { getTicketing } from "@/lib/orders/service";
import { respond, type IdContext } from "@/lib/orders/http";

export const dynamic = "force-dynamic";

/** POST /api/orders/{id}/pay: the "Simulated payment" button. No card, no money (HW3 scope). */
export async function POST(_request: Request, { params }: IdContext): Promise<Response> {
  const { id } = await params;
  return respond(getTicketing().pay(id));
}
