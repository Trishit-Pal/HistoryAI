"use client";

export function HallOrderNav({
  earlier,
  later,
  onFocus,
}: {
  earlier?: string;
  later?: string;
  onFocus: (id: string) => void;
}) {
  return (
    <div className="hall-order">
      <button type="button" disabled={!earlier} onClick={() => earlier && onFocus(earlier)}>
        Earlier in this hall
      </button>
      <button type="button" disabled={!later} onClick={() => later && onFocus(later)}>
        Later in this hall
      </button>
    </div>
  );
}
