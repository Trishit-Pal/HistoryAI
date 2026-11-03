import type { ReactNode } from "react";
import {
  Barlow_Semi_Condensed,
  IBM_Plex_Mono,
  Literata,
  Syne,
  Cormorant_Garamond,
  Space_Grotesk,
} from "next/font/google";
import { SiteNav } from "../components/SiteNav";
import "./globals.css";

const display = Syne({ subsets: ["latin"], variable: "--font-display" });
const body = Literata({ subsets: ["latin"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
const nightDisplay = Cormorant_Garamond({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-night-display" });
const nightUi = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-night-ui" });
// Drafting-sheet lettering for the corridor (.shell) only; --font-display stays for the other pages.
const sheet = Barlow_Semi_Condensed({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sheet" });

export const metadata = {
  title: "Hall of Eras",
  description: "A sourced walk through the technical and documented history of artificial intelligence.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable} ${nightDisplay.variable} ${nightUi.variable} ${sheet.variable}`}>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
