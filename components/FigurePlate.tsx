"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { LABEL_FONT } from "./labelFont";
import { Color, ShaderMaterial, SRGBColorSpace, Texture, TextureLoader } from "three";
import { CHALK, CHALK_DIM, INK, PRINT, REDLINE } from "../src/museum/theme";
import { Outline } from "./Ink";

const W = 0.72;
const H = 0.48;
const PHOTO_INSET = 0.04;
// A photo keeps its tones but is dimmed so it does not glow in the night room
// (0.55 linear, about 0.77 of its sRGB brightness).
const PHOTO_DIM = new Color(0.55, 0.55, 0.55);

function isPhoto(src: string): boolean {
  return /\.(jpe?g|png|webp)$/i.test(src);
}

// Line drawings on light paper are drawn as light linework on the dark plate: luminance is
// inverted onto PRINT → CHALK, and any colour (the gold accents) keeps its chroma.
// Mounted only for drawings, so photos never build this material.
function Linework({ map, opacity }: { map: Texture; opacity: number }) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          map: { value: null },
          paper: { value: new Color(PRINT) },
          line: { value: new Color(CHALK) },
          gold: { value: new Color(REDLINE) },
          opacity: { value: 1 },
        },
        vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: `
          uniform sampler2D map; uniform vec3 paper; uniform vec3 line; uniform vec3 gold; uniform float opacity; varying vec2 vUv;
          void main() {
            vec4 t = texture2D(map, vUv);
            vec3 c = mix(vec3(1.0), t.rgb, t.a);
            float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
            // Linear light: the pale paper (~0.78) drops to the plate, dark ink rises to chalk.
            float inked = smoothstep(0.26, 0.8, 1.0 - l);
            vec3 stroke = mix(line, gold, clamp(length(c - vec3(l)) * 4.0, 0.0, 1.0));
            gl_FragColor = vec4(mix(paper, stroke, inked), opacity);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useLayoutEffect(() => {
    material.uniforms.map.value = map;
    material.uniforms.opacity.value = opacity;
    material.transparent = opacity < 1;
  }, [material, map, opacity]);
  return (
    <mesh position={[0, 0, 0.002]} material={material}>
      <planeGeometry args={[W - 0.02, H - 0.02]} />
    </mesh>
  );
}

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

  const opacity = ghost ? 0.25 : 1;
  const photo = Boolean(map && src && isPhoto(src));

  return (
    <group>
      {/* The mat: a dark plate with a thin gold-dim (photo) or chalk-dim (drawing) frame. */}
      <mesh>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial color={PRINT} transparent={ghost} opacity={opacity} />
        <Outline color={photo ? REDLINE : CHALK_DIM} opacity={0.55 * opacity} />
      </mesh>
      {map && photo ? (
        <mesh position={[0, 0, 0.002]}>
          <planeGeometry args={[W - 2 * PHOTO_INSET, H - 2 * PHOTO_INSET]} />
          <meshBasicMaterial color={PHOTO_DIM} map={map} transparent={ghost} opacity={opacity} />
        </mesh>
      ) : null}
      {map && !photo ? <Linework map={map} opacity={opacity} /> : null}
      <Text font={LABEL_FONT} position={[0, -0.32, 0.02]} fontSize={0.04} color={INK} anchorX="center" anchorY="middle" maxWidth={0.7}>
        {id}
      </Text>
    </group>
  );
}
