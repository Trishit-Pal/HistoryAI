import type { Spot } from "./precursorsRoom";

type Point = readonly [number, number, number];

function place(ids: readonly string[], points: readonly Point[]): Spot[] {
  return ids.map((id, index) => {
    const point = points[index] ?? [0, 0, -1.2 - index * 1.6];
    return { id, x: point[0], y: point[1], z: point[2] };
  });
}

function founding(ids: readonly string[]): Spot[] {
  return place(ids, [
    [-1.35, 0.72, -1.6],
    [1.35, 0.72, -1.6],
  ]);
}

function symbolic(ids: readonly string[]): Spot[] {
  return ids.map((id, index) => ({
    id,
    x: index % 2 === 0 ? -1.6 : 1.6,
    y: -index * 0.1,
    z: -1.3 - index * 2.1,
  }));
}

function firstWinter(ids: readonly string[]): Spot[] {
  return place(ids, [
    [-2, 0, -2.2],
    [2, 0, -2.2],
  ]);
}

// A row along one counter, centre first when there is only one; the room's walls are at x = ±2.8.
function expert(ids: readonly string[]): Spot[] {
  if (ids.length <= 1) return place(ids, [[0, 0.22, -2.2]]);
  return place(ids, [
    [-1.4, 0.22, -2.2],
    [0, 0.22, -2.2],
    [1.4, 0.22, -2.2],
  ]);
}

function secondWinter(ids: readonly string[]): Spot[] {
  return place(ids, [[0, 0, -1.7]]);
}

function statistical(ids: readonly string[]): Spot[] {
  const board: Point = [-1.55, 0.08, -2];
  const stand: Point = [1.55, 0.72, -2];
  return ids.map((id, index) => {
    const point = id.includes("watson") ? stand : id.includes("deep_blue") ? board : index === 0 ? board : stand;
    return { id, x: point[0], y: point[1], z: point[2] };
  });
}

function deepLearning(ids: readonly string[]): Spot[] {
  return place(ids, [
    [0, 0, -1.15],
    [-0.95, 0, -2],
    [0.95, 0, -2],
    [-0.55, 0, -2.85],
    [0.55, 0, -2.85],
  ]);
}

function transformers(ids: readonly string[]): Spot[] {
  if (ids.length <= 2) {
    return place(ids, [
      [-0.85, 0, -1.7],
      [0.85, 0, -1.7],
    ]);
  }
  // Three in a V: the middle one forward, so its screen stays clear of the next-hall door.
  return place(ids, [
    [-1.3, 0, -1.7],
    [0, 0, -1],
    [1.3, 0, -1.7],
  ]);
}

function generative(ids: readonly string[]): Spot[] {
  return place(ids, [
    [-2.15, 0.56, -1.9],
    [2.15, 0.56, -1.9],
    [-1.3, 0.56, -3.5],
    [1.3, 0.56, -3.5],
    [0, 0.56, -0.3],
  ]);
}

// The zigzag widens down the hall but stops short of the walls at x = ±3.1.
const FRONTIER_MAX_X = 1.9;

function frontier(ids: readonly string[]): Spot[] {
  return ids.map((id, index) => ({
    id,
    x: (index % 2 === 0 ? -1 : 1) * Math.min(0.65 + index * 0.22, FRONTIER_MAX_X),
    y: 0.02,
    z: -1.05 - index * 1.65,
  }));
}

const LAYOUTS: Record<string, (ids: readonly string[]) => Spot[]> = {
  era_1_founding: founding,
  era_2_symbolic: symbolic,
  era_3_first_winter: firstWinter,
  era_4_expert_systems: expert,
  era_5_second_winter: secondWinter,
  era_6_statistical: statistical,
  era_7_deep_learning: deepLearning,
  era_8_transformers: transformers,
  era_9_generative: generative,
  era_10_frontier: frontier,
};

export function eraLayout(hallId: string, exhibitIds: readonly string[]): Spot[] | undefined {
  const layout = LAYOUTS[hallId];
  if (!layout) return undefined;
  return layout(exhibitIds);
}

export function eraSpot(hallId: string, exhibitIds: readonly string[], id: string): Spot | undefined {
  return eraLayout(hallId, exhibitIds)?.find((spot) => spot.id === id);
}
