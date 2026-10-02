import { museumHalls, museumNodes } from "./payload";
import { seedMuseum } from "../seed/eras";
import type { ChangelogLine } from "../store/memory";

export function loadMuseum() {
  const store = seedMuseum();
  return {
    nodes: museumNodes(store),
    halls: museumHalls(store),
    changelog: store.changelog() as ChangelogLine[],
  };
}
