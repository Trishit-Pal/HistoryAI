"use client";

import { useEffect, useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { SRGBColorSpace, Texture, TextureLoader } from "three";

const ZINC = "#E4E7EA";
const INK = "#1E2430";

export function FigurePlate({
  src,
  id,
  load,
  ghost,
}: {
  src?: string;
  id: string;
  load: boolean;
  ghost: boolean;
}) {
  const held = useRef<Texture | null>(null);
  const [map, setMap] = useState<Texture | null>(null);
  useEffect(() => {
    const release = () => {
      held.current?.dispose();
      held.current = null;
      setMap(null);
    };
    if (!load || !src) {
      release();
      return;
    }
    let alive = true;
    const loader = new TextureLoader();
    loader.load(
      src,
      (texture) => {
        if (!alive) {
          texture.dispose();
          return;
        }
        held.current?.dispose();
        texture.colorSpace = SRGBColorSpace;
        held.current = texture;
        setMap(texture);
      },
      undefined,
      () => {
        if (alive) release();
      },
    );
    return () => {
      alive = false;
      release();
    };
  }, [load, src]);

  return (
    <group>
      <mesh>
        <planeGeometry args={[0.72, 0.48]} />
        <meshStandardMaterial
          color={map ? "#ffffff" : ZINC}
          map={map ?? undefined}
          transparent={ghost}
          opacity={ghost ? 0.25 : 1}
          roughness={0.5}
        />
      </mesh>
      <Text position={[0, -0.32, 0.02]} fontSize={0.04} color={INK} anchorX="center" anchorY="middle" maxWidth={0.7}>
        {id}
      </Text>
    </group>
  );
}
