"use client";

import { useState } from "react";
import { Html, Text, useCursor } from "@react-three/drei";
import { INK } from "../src/museum/theme";
import type { MuseumNode } from "../src/museum/view";
import { Ink } from "./Ink";
import { LABEL_FONT } from "./labelFont";

const GHOST_OPACITY = 0.25;

export function Monument({
  node,
  position,
  focused,
  ghost,
  onFocus,
  showLabel = true,
}: {
  node: MuseumNode;
  position: [number, number, number];
  focused: boolean;
  ghost: boolean;
  onFocus: (id: string) => void;
  showLabel?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const opacity = ghost ? GHOST_OPACITY : 1;
  const discH = 0.02;
  const plinthH = 0.12;
  const shaftH = 0.7;
  const capH = 0.08;
  const shaftD = 0.28;
  const plaqueD = 0.02;
  const yDisc = discH / 2;
  const yPlinth = discH + plinthH / 2;
  const yShaft = discH + plinthH + shaftH / 2;
  const yCap = discH + plinthH + shaftH + capH / 2;
  const zPlaque = shaftD / 2 + plaqueD / 2;
  const stackH = discH + plinthH + shaftH + capH;
  return (
    <group position={position}>
      <mesh position={[0, yDisc, 0]}>
        <cylinderGeometry args={[0.64, 0.64, discH, 32]} />
        <Ink tone="floor" opacity={opacity} accent={focused} />
      </mesh>
      <mesh position={[0, yPlinth, 0]}>
        <boxGeometry args={[0.85, plinthH, 0.85]} />
        <Ink tone="stone" opacity={opacity} accent={focused} />
      </mesh>
      <mesh position={[0, yShaft, 0]}>
        <boxGeometry args={[0.28, shaftH, shaftD]} />
        <Ink tone="stone" opacity={opacity} accent={focused} />
      </mesh>
      <mesh position={[0, yShaft, zPlaque]}>
        <boxGeometry args={[0.5, 0.22, plaqueD]} />
        <Ink tone="print" opacity={opacity} />
      </mesh>
      <Text
        font={LABEL_FONT}
        position={[0, yShaft, zPlaque + plaqueD / 2 + 0.012]}
        fontSize={0.1}
        color={INK}
        fillOpacity={opacity}
        anchorX="center"
        anchorY="middle"
      >
        {String(node.startYear)}
      </Text>
      <mesh position={[0, yCap, 0]}>
        <boxGeometry args={[0.36, capH, 0.36]} />
        <Ink tone={focused ? "redline" : "metal"} opacity={opacity} />
      </mesh>
      <mesh
        position={[0, stackH / 2, 0]}
        onClick={(event) => {
          event.stopPropagation();
          onFocus(node.id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1.32, stackH, 1.32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {showLabel ? (
        <Html position={[0, 1.15, 0]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
          <div className={`badge badge-${node.confidence ?? "unset"}${ghost ? " ghost" : ""}`}>
            {node.confidence ?? "unset"} · {node.title}
          </div>
        </Html>
      ) : null}
    </group>
  );
}
