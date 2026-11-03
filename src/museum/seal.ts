import { isRoomSealed, type Hall } from "../domain/layout";
import type { MuseumNode } from "./view";

// Where the visitor is standing: the exhibit on the plate and the hall the camera is in.
export type NavState = { focusedId: string | null; hallIndex: number };

export type NavContext = { halls: readonly Hall[]; nodes: readonly MuseumNode[]; year: number };

// A hall is sealed by the same rule as a floor room (isRoomSealed).
export function isSealed(hall: Hall, nodes: readonly MuseumNode[], year: number): boolean {
  return isRoomSealed(hall, (id) => nodes.find((node) => node.id === id)?.startYear, year);
}

function hallIndexOf(halls: readonly Hall[], id: string): number {
  return halls.findIndex((hall) => hall.exhibitIds.includes(id));
}

export function focusExhibit(state: NavState, id: string, { halls, nodes, year }: NavContext): NavState {
  const index = hallIndexOf(halls, id);
  const target = halls[index];
  const enters = target !== undefined && !isSealed(target, nodes, year);
  return { focusedId: id, hallIndex: enters ? index : state.hallIndex };
}

export function enterHall(state: NavState, index: number, { halls, nodes, year }: NavContext): NavState {
  const next = Math.max(0, Math.min(halls.length - 1, index));
  const hall = halls[next];
  if (!hall || isSealed(hall, nodes, year)) return state;
  const first = hall.exhibitIds.find((id) => {
    const node = nodes.find((item) => item.id === id);
    return node !== undefined && node.startYear <= year;
  });
  return { focusedId: first ?? state.focusedId, hallIndex: next };
}

// After the year cursor moves: leave a future exhibit for the nearest one in view,
// and leave a hall that has just sealed for the nearest open hall behind it.
export function reconcileFocus(state: NavState, ctx: NavContext): NavState {
  const { halls, nodes, year } = ctx;
  const current = nodes.find((node) => node.id === state.focusedId);
  if (current && current.startYear > year) {
    const inView = nodes.filter((node) => node.startYear <= year);
    if (inView.length === 0) return state;
    const nearest = inView.reduce((best, node) =>
      Math.abs(node.startYear - year) < Math.abs(best.startYear - year) ? node : best,
    );
    return focusExhibit(state, nearest.id, ctx);
  }
  const hall = halls[state.hallIndex];
  if (hall && isSealed(hall, nodes, year)) {
    for (let i = state.hallIndex - 1; i >= 0; i -= 1) {
      const earlier = halls[i];
      if (earlier && !isSealed(earlier, nodes, year)) return enterHall(state, i, ctx);
    }
  }
  return state;
}
