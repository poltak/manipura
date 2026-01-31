import "../styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Manipura Cockpit",
  description: "AI-mediated conversation cockpit"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
