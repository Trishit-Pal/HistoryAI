import type { Hall } from "../../src/domain/layout";
import type { MuseumNode } from "../../src/museum/view";

export type RoomProps = {
  hall: Hall;
  originZ: number;
  hallIndex: number;
  members: MuseumNode[];
  year: number;
  focusedId: string | null;
  nextLabel?: string;
  nextSealed?: boolean;
  nextYear?: number | null;
  onFocus: (id: string) => void;
  onHall: (index: number) => void;
};
