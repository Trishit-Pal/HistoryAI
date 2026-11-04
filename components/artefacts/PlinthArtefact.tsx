"use client";

import { type ComponentType, useState } from "react";
import { useCursor } from "@react-three/drei";
import { Ink } from "../Ink";
import { artefactFor, type ArtefactKey } from "../../src/museum/artefacts";
import { AnalyticalEngine } from "./AnalyticalEngine";
import { DeepBlue } from "./DeepBlue";
import { GoBoard } from "./GoBoard";
import { Gtx580Pair } from "./Gtx580Pair";
import { MarkIPerceptron } from "./MarkIPerceptron";
import type { ArtefactProps } from "./motion";
import { Protein } from "./Protein";
import { Relay } from "./Relay";

const COMPONENTS: Record<ArtefactKey, ComponentType<ArtefactProps>> = {
  analyticalEngine: AnalyticalEngine,
  relay: Relay,
  markIPerceptron: MarkIPerceptron,
  deepBlue: DeepBlue,
  goBoard: GoBoard,
  gtx580Pair: Gtx580Pair,
  protein6y4f: Protein,
};

// Monument's stack is 0.92 tall (disc + plinth + shaft + cap). A display slab sized to the
// artefact's scaled footprint sits on the cap, and the artefact stands on the slab.
export const PLINTH_TOP = 0.92;
const SLAB_H = 0.04;
const SLAB_MARGIN = 0.06;
export const LABEL_ABOVE_ARTEFACT = 2.1;

export function hasArtefact(exhibitId: string): boolean {
  return artefactFor(exhibitId) !== undefined;
}

// Mounted only near the focused spot (the FigurePlate rule) and never for a ghost exhibit.
export function PlinthArtefact({
  exhibitId,
  position,
  focused,
  load,
  ghost,
  highlight,
  onFocus,
}: {
  exhibitId: string;
  position: [number, number, number];
  focused: boolean;
  load: boolean;
  ghost: boolean;
  highlight?: string;
  onFocus: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const artefact = artefactFor(exhibitId);
  if (!artefact || !load || ghost) return null;
  const Model = COMPONENTS[artefact.component];
  const [w, d] = artefact.footprint;
  return (
    <group
      position={[position[0], position[1] + PLINTH_TOP, position[2]]}
      onClick={(event) => {
        event.stopPropagation();
        onFocus(exhibitId);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, SLAB_H / 2, 0]}>
        <boxGeometry args={[w * artefact.scale + SLAB_MARGIN, SLAB_H, d * artefact.scale + SLAB_MARGIN]} />
        <Ink tone="stone" />
      </mesh>
      <group position={[0, SLAB_H, 0]} scale={artefact.scale}>
        <Model active={focused || hovered} highlight={highlight} />
      </group>
    </group>
  );
}
