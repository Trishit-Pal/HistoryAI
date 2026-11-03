import type { ReactNode } from "react";
import { isHttpUrl } from "../src/domain/urls";

export function SafeLink({
  href,
  children,
  rel = "noopener noreferrer",
}: {
  href: string;
  children: ReactNode;
  rel?: string;
}) {
  if (!isHttpUrl(href)) return <span>{children}</span>;
  return (
    <a href={href} rel={rel}>
      {children}
    </a>
  );
}
