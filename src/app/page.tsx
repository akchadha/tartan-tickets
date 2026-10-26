import { EventList } from "@/components/EventList";
import { getEventStore } from "@/lib/events/store";
import { listUpcomingEvents } from "@/lib/events/upcoming";

// Work out "upcoming" on every visit, not once at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = listUpcomingEvents(getEventStore().all(), new Date());
  return (
    <>
      <header className="masthead">
        <div className="masthead-label">
          <h1>Tartan Tickets</h1>
          <p>Tickets for student club events</p>
        </div>
      </header>
      <main className="page">
        <h2 className="section-title">Upcoming events</h2>
        <EventList events={events} />
      </main>
    </>
  );
}
