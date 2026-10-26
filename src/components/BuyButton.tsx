"use client";

import { useState } from "react";

/** Placeholder until Story 3 (checkout). Tells the student what's going on instead of doing nothing. */
export function BuyButton() {
  const [notice, setNotice] = useState("");
  return (
    <div className="buy">
      <button
        type="button"
        className="button button-primary"
        onClick={() => setNotice("Checkout isn't open yet. Ticket sales arrive in the next update.")}
      >
        Buy tickets
      </button>
      <p role="status" aria-live="polite" className="buy-notice">
        {notice}
      </p>
    </div>
  );
}
