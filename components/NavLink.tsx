"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// `match` lists the path prefixes that count as "here"; "/" alone must match exactly.
export function NavLink({ href, match, children }: { href: string; match: string[]; children: ReactNode }) {
  const path = usePathname();
  const here = match.some((prefix) => (prefix === "/" ? path === "/" : path === prefix || path.startsWith(`${prefix}/`)));
  return (
    <Link href={href} aria-current={here ? "page" : undefined}>
      {children}
    </Link>
  );
}
