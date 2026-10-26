"use client";

// Shown if loading the page fails. Never displays the internal error text to students.
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="page">
      <div role="alert" className="error">
        <p className="error-title">Events couldn&apos;t be loaded.</p>
        <p>Check your internet connection, then try again.</p>
      </div>
      <button type="button" className="button button-primary" onClick={() => reset()}>
        Try again
      </button>
    </main>
  );
}
