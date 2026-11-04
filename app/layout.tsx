import type { ReactNode } from "react";
import { Cormorant_Garamond, IBM_Plex_Mono, Literata, Space_Grotesk } from "next/font/google";
import { SiteNav } from "../components/SiteNav";
import "./globals.css";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" });
const body = Literata({ subsets: ["latin"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
// UI and sheet lettering.
const sheet = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sheet" });

export const metadata = {
  title: "Hall of Eras",
  description: "A sourced walk through the technical and documented history of artificial intelligence.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable} ${sheet.variable}`}>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
