"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { type ElementRef, Suspense, useEffect, useMemo, useRef } from "react";
import { BackSide, Color, Quaternion, TextureLoader, Vector3 } from "three";
import { PRUSSIAN } from "../../src/museum/theme";
import { Columns, type ColumnsProps, EARTH_RADIUS } from "./Columns";
import { latLonToVector } from "./geo";

// The planet in Blue Marble's own colours, dimmed in the material so the gold reads (the pixels are NASA's).
const TONE = 0.72;
// The limb falls to this share of full brightness, so the sphere reads as round without a light.
const LIMB = 0.42;
const HALO = new Color("#9fc4ff");
// Over the Atlantic, so the Americas, Europe and Africa face the visitor on arrival.
const START: [number, number, number] = latLonToVector(24, -32, 4);
const FOV = 35;
// On arrival the planet and its tallest columns fill this share of the narrower side of the view.
const FIT_RADIUS = 1.32;
const MIN_DISTANCE = 1.45;
const MAX_DISTANCE = 7;
// A picked country is shown from this far south of it, so its column leans into view instead of pointing at the visitor.
const VIEW_FROM_SOUTH = 28;
const DAMPING = 0.08;
const FLY_SECONDS = 1;

type Controls = ElementRef<typeof OrbitControls>;

const EARTH_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;

const EARTH_FRAGMENT = /* glsl */ `
  uniform sampler2D map;
  uniform float tone;
  uniform float limb;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float facing = clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0);
    vec3 colour = texture2D(map, vUv).rgb * tone * mix(limb, 1.0, smoothstep(0.0, 0.55, facing));
    gl_FragColor = vec4(colour, 1.0);
  }`;

// A thin shell behind the planet: brightest at the limb, gone by its own edge.
const HALO_FRAGMENT = /* glsl */ `
  uniform vec3 colour;
  varying vec3 vNormal;
  void main() {
    float rim = clamp(-normalize(vNormal).z / 0.38, 0.0, 1.0);
    gl_FragColor = vec4(colour, pow(rim, 3.0) * 0.55);
  }`;

function Earth() {
  const map = useLoader(TextureLoader, "/globe/earth.jpg");
  const gl = useThree((state) => state.gl);
  map.anisotropy = gl.capabilities.getMaxAnisotropy();
  const uniforms = useMemo(() => ({ map: { value: map }, tone: { value: TONE }, limb: { value: LIMB } }), [map]);
  const halo = useMemo(() => ({ colour: { value: HALO } }), []);
  return (
    <group>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, 128, 96]} />
        <shaderMaterial uniforms={uniforms} vertexShader={EARTH_VERTEX} fragmentShader={EARTH_FRAGMENT} />
      </mesh>
      <mesh scale={1.08} raycast={() => null}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 48]} />
        <shaderMaterial uniforms={halo} vertexShader={EARTH_VERTEX} fragmentShader={HALO_FRAGMENT} side={BackSide} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

interface RigProps {
  focus: GlobeScenePropsBase["focus"];
  reduced: boolean;
}

/**
 * Orbit on any axis and zoom from the whole planet to a country; no pan, so the planet stays centred.
 * Picking a country turns it to face the visitor over about a second, or at once under reduced motion.
 */
function Rig({ focus, reduced }: RigProps) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const controls = useThree((state) => state.controls) as unknown as Controls | null;
  const flight = useRef<gsap.core.Tween | null>(null);
  const size = useThree((state) => state.size);
  const fitted = useRef(false);

  // Once, on arrival: back off until the whole planet fits a phone's narrow view as well as a desktop's.
  useEffect(() => {
    if (fitted.current || size.width === 0 || size.height === 0) return;
    fitted.current = true;
    const half = (FOV * Math.PI) / 360;
    const narrow = Math.min(half, Math.atan(Math.tan(half) * (size.width / size.height)));
    camera.position.setLength(Math.min(MAX_DISTANCE, FIT_RADIUS / Math.sin(narrow)));
    invalidate();
  }, [camera, size, invalidate]);

  useEffect(() => {
    if (!focus || !controls) return;
    const from = camera.position.clone();
    const distance = from.length();
    const to = new Vector3(...latLonToVector(Math.max(-80, focus.lat - VIEW_FROM_SOUTH), focus.lon, 1));
    const start = from.clone().normalize();
    const turn = new Quaternion().setFromUnitVectors(start, to);
    const place = (t: number) => {
      // Along the great circle, so the camera keeps its height above the planet.
      const partial = new Quaternion().slerp(turn, t);
      camera.position.copy(start.clone().applyQuaternion(partial).multiplyScalar(distance));
      controls.update();
      invalidate();
    };
    if (reduced) {
      place(1);
      return;
    }
    const step = { t: 0 };
    const tween = gsap.to(step, { t: 1, duration: FLY_SECONDS, ease: "power2.inOut", onUpdate: () => place(step.t) });
    flight.current = tween;
    return () => {
      tween.kill();
    };
  }, [camera, controls, focus, reduced, invalidate]);

  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      enableDamping={!reduced}
      dampingFactor={DAMPING}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}
      zoomSpeed={0.6}
      onChange={(event) => {
        // Closer in, a drag turns the planet less, so a country does not fly past.
        const self = event?.target as Controls | undefined;
        if (self) self.rotateSpeed = Math.min(1, Math.max(0.12, (camera.position.length() - EARTH_RADIUS) / 2.3)) * 0.8;
      }}
      // A drag takes over from a turn in progress.
      onStart={() => flight.current?.kill()}
    />
  );
}

interface GlobeScenePropsBase {
  /** The picked country's place, which the camera turns to; null leaves the camera where it is. */
  focus: { lat: number; lon: number; seq: number } | null;
}

export type GlobeSceneProps = ColumnsProps & GlobeScenePropsBase;

export function GlobeScene({ focus, ...columns }: GlobeSceneProps) {
  return (
    <Canvas flat frameloop="demand" dpr={[1, 2]} camera={{ fov: FOV, position: START, near: 0.05, far: 50 }} gl={{ antialias: true }}>
      <color attach="background" args={[PRUSSIAN]} />
      <Suspense fallback={null}>
        <Earth />
        <Columns {...columns} />
      </Suspense>
      <Rig focus={focus} reduced={columns.reduced} />
    </Canvas>
  );
}
