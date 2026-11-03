"use client";

import { eraLayout } from "../../src/museum/eraRooms";
import {
  TRANSFORMER_FLOOR_CENTER_Z,
  TRANSFORMER_FLOOR_DEPTH,
  transformerScreenBox,
} from "../../src/museum/roomBoxes";
import { HallTitle, Ink, NextMark, RoomExhibits } from "./roomKit";
import type { RoomProps } from "./roomProps";

export function TransformersRoom({
  hall,
  originZ,
  hallIndex,
  members,
  year,
  focusedId,
  nextLabel,
  nextYear,
  nextSealed,
  onFocus,
  onHall,
}: RoomProps) {
  const spots = eraLayout(hall.id, hall.exhibitIds) ?? [];
  return (
    <group position={[0, 0, originZ]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, TRANSFORMER_FLOOR_CENTER_Z]} onClick={() => onHall(hallIndex)}>
        <planeGeometry args={[4.2, TRANSFORMER_FLOOR_DEPTH]} />
        <Ink tone="floor" />
      </mesh>
      <mesh position={[2.1, 1.4, -1.8]}>
        <boxGeometry args={[0.1, 2.8, 3.6]} />
        <Ink tone="wall" />
      </mesh>
      <mesh position={[-2.1, 1.4, -1.8]}>
        <boxGeometry args={[0.1, 2.8, 3.6]} />
        <Ink tone="wall" />
      </mesh>
      {spots.map((spot) => {
        const screen = transformerScreenBox(spot);
        return (
          <mesh key={spot.id} position={screen.position}>
            <boxGeometry args={screen.size} />
            <Ink tone="stone" />
          </mesh>
        );
      })}
      <HallTitle position={[0, 2.35, -0.2]} label={hall.label} />
      <RoomExhibits members={members} spots={spots} year={year} focusedId={focusedId} onFocus={onFocus} />
      <NextMark z={-3.3} nextLabel={nextLabel} nextYear={nextYear} nextSealed={nextSealed} onNext={() => onHall(hallIndex + 1)} />
    </group>
  );
}
