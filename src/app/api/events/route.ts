import { getTicketing } from "@/lib/orders/service";
import { listUpcomingEvents } from "@/lib/events/upcoming";

export const dynamic = "force-dynamic";

/** GET /api/events (API contract §5): the same upcoming events the home page shows. */
export async function GET(): Promise<Response> {
  const events = listUpcomingEvents(getTicketing().liveEvents(), new Date());
  return Response.json({ events }, { status: 200 });
}
