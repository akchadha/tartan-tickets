import type { Metadata } from "next";
import { cssVariables } from "@/lib/theme/tokens";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tartan Tickets",
  description: "Tickets for student club events.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Colour tokens come from src/lib/theme/tokens.ts (our own constants, not user input). */}
        <style dangerouslySetInnerHTML={{ __html: cssVariables() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
