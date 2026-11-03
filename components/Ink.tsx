"use client";

import { useLayoutEffect, useRef } from "react";
import { EdgesGeometry, type LineSegments, type Mesh, type Side } from "three";
import { CHALK, CHALK_DIM, PRINT, PRUSSIAN, REDLINE } from "../src/museum/theme";

const EDGE_ANGLE = 15;

// A 1px chalk outline of the parent mesh's silhouette and creases (the drawn line of a plan).
export function Outline({ color, opacity = 1 }: { color: string; opacity?: number }) {
  const ref = useRef<LineSegments>(null);
  useLayoutEffect(() => {
    const line = ref.current;
    const source = (line?.parent as Mesh | null | undefined)?.geometry;
    if (!line || !source) return;
    const edges = new EdgesGeometry(source, EDGE_ANGLE);
    line.geometry = edges;
    return () => edges.dispose();
  }, []);
  return (
    <lineSegments ref={ref} raycast={() => null}>
      <lineBasicMaterial color={color} transparent={opacity < 1} opacity={opacity} />
    </lineSegments>
  );
}

export type Tone = "floor" | "wall" | "winter" | "stone" | "metal" | "print" | "redline";

type ToneStyle = { fill: string | null; line: string | null; lineOpacity: number };

// fill null = no solid, only the drawn outline (the floor shows the grid through it).
const TONES: Record<Tone, ToneStyle> = {
  floor: { fill: null, line: CHALK_DIM, lineOpacity: 0.45 },
  wall: { fill: PRUSSIAN, line: CHALK_DIM, lineOpacity: 0.9 },
  winter: { fill: PRUSSIAN, line: CHALK_DIM, lineOpacity: 0.55 },
  stone: { fill: PRUSSIAN, line: CHALK, lineOpacity: 1 },
  metal: { fill: CHALK, line: null, lineOpacity: 1 },
  print: { fill: PRINT, line: null, lineOpacity: 1 },
  redline: { fill: REDLINE, line: null, lineOpacity: 1 },
};

// The material and outline for one mesh. A solid is filled in the ground colour so it hides
// the lines behind it, like a hidden-line drawing. Put it inside a <mesh> in place of a material.
export function Ink({
  tone,
  side,
  opacity = 1,
  accent = false,
}: {
  tone: Tone;
  side?: Side;
  opacity?: number;
  accent?: boolean;
}) {
  const style = TONES[tone];
  const line = accent ? REDLINE : style.line;
  return (
    <>
      {style.fill ? (
        <meshBasicMaterial
          color={style.fill}
          side={side}
          transparent={opacity < 1}
          opacity={opacity}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      ) : (
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={side} />
      )}
      {line ? <Outline color={line} opacity={style.lineOpacity * opacity} /> : null}
    </>
  );
}
