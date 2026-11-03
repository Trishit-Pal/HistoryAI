import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Site">
      <Link href="/">Halls</Link>
      <Link href="/atlas">The scale of AI</Link>
      <Link href="/accuracy">How this stays accurate</Link>
      <Link href="/changelog">Changelog</Link>
    </nav>
  );
}
