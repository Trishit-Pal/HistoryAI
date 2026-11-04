"use client";

import { useEffect, useState } from "react";

export type RailEntry = { id: string; year: string; label: string };

export function YearRail({ entries }: { entries: RailEntry[] }) {
  const [active, setActive] = useState<string | null>(entries[0]?.id ?? null);
  const ids = entries.map((entry) => entry.id).join(" ");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    // The current era is the first band (in page order) that overlaps the strip 10%–40% down the viewport.
    const order = ids.split(" ");
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) visible.add(record.target.id);
          else visible.delete(record.target.id);
        }
        const first = order.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      { rootMargin: "-10% 0px -60% 0px" },
    );
    for (const id of order) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids]);

  return (
    <nav className="tl-rail" aria-label="Eras">
      <ol>
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={entry.id === active ? "location" : undefined}
              title={entry.label}
            >
              <span className="tl-rail-year">{entry.year}</span>
              <span className="tl-rail-label">{entry.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
