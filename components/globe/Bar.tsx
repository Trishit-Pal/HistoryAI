import type { CSSProperties } from "react";

/** A linear bar: `value` as a share of `max`. Decorative; the number beside it carries the value. */
export function Bar({ value, max }: { value: number; max: number }) {
  if (value <= 0 || max <= 0) return null;
  const share = value / max;
  return <span className="globe-bar" aria-hidden="true" style={{ "--share": share } as CSSProperties} />;
}
