/**
 * Named colour tokens (UX spec §6). The CSS variables in layout.tsx are generated
 * from this object, so the contrast tests check exactly what the browser shows.
 */
export const colors = {
  ink: "#1C2B33",      // main text: deep slate
  inkMuted: "#4C5A63", // secondary text
  accent: "#A3162D",   // Tartan red: buttons, prices
  onAccent: "#FFFFFF", // text on accent
  surface: "#FFFFFF",  // event rows
  paper: "#ECEFEA",    // page background: cool stone
  // Tartan stripe colours: decorative only, never used for text.
  plaidGreen: "#23463B",
  plaidNavy: "#1E2D47",
  plaidGold: "#C9A227",
} as const;

export function cssVariables(): string {
  const kebab = (k: string) => k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
  return `:root{${Object.entries(colors)
    .map(([k, v]) => `--color-${kebab(k)}:${v};`)
    .join("")}}`;
}
