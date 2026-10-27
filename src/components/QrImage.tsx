"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** Draws a ticket's QR code as an SVG image. The code holds only the random ticket token (SEC-13). */
export function QrImage({ token, label }: { token: string; label: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let live = true;
    QRCode.toString(token, { type: "svg", margin: 1, errorCorrectionLevel: "M" })
      .then((svg) => live && setSrc(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`))
      .catch(() => live && setSrc(""));
    return () => {
      live = false;
    };
  }, [token]);

  if (!src) return <div className="qr qr-placeholder" aria-hidden="true" />;
  // eslint-disable-next-line @next/next/no-img-element -- a generated data: image, nothing to optimise
  return <img className="qr" src={src} alt={label} width={140} height={140} />;
}
