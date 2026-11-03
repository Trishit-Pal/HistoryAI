"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import type { MuseumNode } from "../../src/museum/view";
import { LABEL_FONT } from "../labelFont";

const GOLD = "#d4af37";
const GAP = 8;

function Lane({
  nodes,
  progress,
  reduced,
  onOpen,
  onYear,
}: {
  nodes: MuseumNode[];
  progress: { current: number };
  reduced: boolean;
  onOpen: (id: string) => void;
  onYear: (year: number) => void;
}) {
  const { camera } = useThree();
  const shown = useRef(-1);

  useFrame(() => {
    const last = Math.max(nodes.length - 1, 1);
    const amount = reduced ? 0 : progress.current;
    const index = Math.round(amount * last);
    camera.position.set(0, 1.7, 6 - index * GAP);
    camera.lookAt(0, 1, camera.position.z - 6);
    if (index !== shown.current) {
      shown.current = index;
      onYear(nodes[index]?.startYear ?? nodes[0]?.startYear ?? 0);
    }
  });

  return (
    <>
      <gridHelper args={[200, 40, GOLD, "#1a1a2e"]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 8, 2]} intensity={1.1} />
      {nodes.map((node, index) => (
        <group key={node.id} position={[index % 2 === 0 ? -1.5 : 1.5, 0, -index * GAP]}>
          <mesh
            position={[0, 0.7, 0]}
            onClick={(event) => {
              event.stopPropagation();
              onOpen(node.id);
            }}
          >
            <boxGeometry args={[1.1, 1.4, 0.12]} />
            <meshStandardMaterial color="#14141f" metalness={0.45} roughness={0.4} />
          </mesh>
          <Text position={[0, 1.7, 0]} font={LABEL_FONT} fontSize={0.16} color={GOLD} anchorX="center" maxWidth={2.4}>
            {node.title}
          </Text>
        </group>
      ))}
    </>
  );
}

export function ScrollHall({
  nodes,
  reduced,
  onOpen,
}: {
  nodes: MuseumNode[];
  reduced: boolean;
  onOpen: (id: string) => void;
}) {
  const wrap = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [year, setYear] = useState(nodes[0]?.startYear ?? 0);

  useEffect(() => {
    const element = wrap.current;
    if (!element || reduced) return;
    const onScroll = () => {
      const total = element.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-element.getBoundingClientRect().top, 0), Math.max(total, 0));
      progress.current = total > 0 ? scrolled / total : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  return (
    <section ref={wrap} className="night-hall" style={{ height: reduced ? "100vh" : `${Math.max(nodes.length, 2) * 28}vh` }}>
      <div className="night-hall-sticky">
        <Canvas camera={{ position: [0, 1.7, 6], fov: 60 }}>
          <color attach="background" args={["#07070d"]} />
          <fogExp2 attach="fog" args={["#07070d", 0.028]} />
          <Lane nodes={nodes} progress={progress} reduced={reduced} onOpen={onOpen} onYear={setYear} />
        </Canvas>
        <p className="night-hud">{year}</p>
      </div>
    </section>
  );
}
