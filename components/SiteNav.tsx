import { NavLink } from "./NavLink";

export function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Site">
      <NavLink href="/" match={["/", "/rooms"]}>
        Timeline
      </NavLink>
      <NavLink href="/atlas" match={["/atlas"]}>
        Atlas
      </NavLink>
      <NavLink href="/accuracy" match={["/accuracy", "/changelog"]}>
        About
      </NavLink>
    </nav>
  );
}
