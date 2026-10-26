export default function Loading() {
  return (
    <main className="page">
      <p role="status" className="loading-text">Loading events…</p>
      <ul className="event-list" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <li key={i} className="event skeleton" />
        ))}
      </ul>
    </main>
  );
}
