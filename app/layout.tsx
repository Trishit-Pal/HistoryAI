import type { ReactNode } from "react";
import { IBM_Plex_Mono, Literata, Syne } from "next/font/google";
import { SiteNav } from "../components/SiteNav";
import "./globals.css";

const display = Syne({ subsets: ["latin"], variable: "--font-display" });
const body = Literata({ subsets: ["latin"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata = {
  title: "Hall of Eras",
  description: "A sourced walk through the technical and documented history of artificial intelligence.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
