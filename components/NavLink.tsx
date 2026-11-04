"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

type Props = { href: string; match: string[]; children: ReactNode };

// The pathname is unknown while prerendering routes with dynamic params (Cache Components),
// so the plain link is the prerendered fallback and the current-page mark streams in after.
export function NavLink({ href, match, children }: Props) {
  return (
    <Suspense fallback={<Link href={href}>{children}</Link>}>
      <ActiveLink href={href} match={match}>
        {children}
      </ActiveLink>
    </Suspense>
  );
}

// `match` lists the path prefixes that count as "here"; "/" alone must match exactly.
function ActiveLink({ href, match, children }: Props) {
  const path = usePathname();
  const here = match.some((prefix) => (prefix === "/" ? path === "/" : path === prefix || path.startsWith(`${prefix}/`)));
  return (
    <Link href={href} aria-current={here ? "page" : undefined}>
      {children}
    </Link>
  );
}
