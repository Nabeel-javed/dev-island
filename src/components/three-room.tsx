'use client';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Html, RoundedBox, OrbitControls } from '@react-three/drei';
import { useEffect, useState, useRef, type ComponentRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, MoveHorizontal, Scan, Footprints } from 'lucide-react';
import { roomCameraFrame, ROOM_FOV } from '@/lib/room-camera';
import * as THREE from 'three';
import { BUILDINGS, scenePalette } from '@/lib/buildings';
import { roomDecor } from '@/lib/room-decor';
import { PALETTES, seed } from '@/lib/island';
import { STATIONS } from '@/lib/room';
import { Explorer } from './three-island';
import RoomAtmosphere from './room-atmosphere';
import RoomFurnishings from './room-furnishings';
import RoomActivity from './room-activity';
import RoomMaterial, { type Finish } from './room-material';
import RoomWindow from './room-window';
import RoomArchitecture from './room-architecture';
import type { RoomSceneProps } from './room-scene-types';
function Box({
  at,
  size,
  color,
  finish,
}: {
  at: [number, number, number];
  size: [number, number, number];
  color: string;
  finish?: Finish;
}) {
  if (Math.min(...size) >= 0.1)
    return (
      <RoundedBox
        position={at}
        args={size}
        radius={Math.min(0.055, Math.min(...size) / 5)}
        smoothness={2}
        castShadow
        receiveShadow
      >
        {finish ? (
          <RoomMaterial color={color} finish={finish} />
        ) : (
          <meshStandardMaterial color={color} roughness={0.8} />
        )}
      </RoundedBox>
    );
  return (
    <mesh position={at} castShadow receiveShadow>
      <boxGeometry args={size} />
      {finish ? (
        <RoomMaterial color={color} finish={finish} />
      ) : (
        <meshStandardMaterial color={color} roughness={0.9} />
      )}
    </mesh>
  );
}
type CameraProps = Pick<RoomSceneProps, 'controller' | 'reducedMotion'> & {
  zoom: number;
  angle: number;
  overview: boolean;
  reset: number;
};
function Camera({ zoom, angle, overview, reset, controller, reducedMotion }: CameraProps) {
  const { camera, size } = useThree();
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const destination = useRef(new THREE.Vector3());
  const focus = useRef(new THREE.Vector3());
  const shift = useRef(new THREE.Vector3());
  const arriving = useRef(true);
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera) || !controls.current) return;
    camera.fov = overview ? ROOM_FOV : 58;
    const frame = roomCameraFrame(size.width, size.height, zoom, angle);
    if (overview) {
      destination.current.set(...frame.position);
      focus.current.set(...frame.target);
    } else {
      const c = controller.current;
      focus.current.set(c.x * (size.width < 760 ? 0.85 : 0.4), 1.1, c.y * 0.25 - 1.3);
      destination.current.set(Math.sin(angle) * 8, 3.3, Math.cos(angle) * 8);
      destination.current.multiplyScalar(1 / zoom).add(focus.current);
    }
    controls.current.target.copy(focus.current);
    camera.position
      .copy(destination.current)
      .add(new THREE.Vector3(0, reducedMotion ? 0 : 1.5, reducedMotion ? 0 : 3));
    camera.lookAt(focus.current);
    camera.updateProjectionMatrix();
    arriving.current = !reducedMotion;
    controls.current.update();
  }, [camera, size.width, size.height, zoom, angle, overview, reset, controller, reducedMotion]);
  useFrame((_, dt) => {
    const orbit = controls.current;
    if (!orbit) return;
    if (arriving.current) {
      camera.position.lerp(destination.current, 1 - Math.exp(-5 * dt));
      if (camera.position.distanceTo(destination.current) < 0.015) arriving.current = false;
      orbit.update();
    } else if (!overview && controller.current.moving && !controller.current.paused) {
      const c = controller.current;
      focus.current.set(c.x * (size.width < 760 ? 0.85 : 0.4), 1.1, c.y * 0.25 - 1.3);
      shift.current
        .copy(focus.current)
        .sub(orbit.target)
        .multiplyScalar(reducedMotion ? 1 : 1 - Math.exp(-4 * dt));
      orbit.target.add(shift.current);
      camera.position.add(shift.current);
      orbit.update();
    }
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping={!reducedMotion}
      dampingFactor={0.08}
      minDistance={5}
      maxDistance={overview ? 70 : 22}
      minPolarAngle={0.35}
      maxPolarAngle={1.38}
      minAzimuthAngle={-0.85}
      maxAzimuthAngle={0.85}
      onStart={() => {
        arriving.current = false;
      }}
    />
  );
}
function Room(props: RoomSceneProps & CameraProps) {
  const [hovered, setHovered] = useState(-1);
  useEffect(
    () => () => {
      document.body.style.cursor = '';
    },
    [],
  );
  const theme = BUILDINGS[props.building],
    night = props.lighting === 'night';
  const colors = {
    ...scenePalette(props.palette, props.lighting),
    accent: theme.accent,
    roof: theme.roof,
  };
  return (
    <>
      <color attach="background" args={[night ? '#20333a' : theme.wall]} />
      <Camera {...props} />
      <RoomActivity reducedMotion={props.reducedMotion} night={night} />
      <RoomWindow reducedMotion={props.reducedMotion} night={night} />
      <RoomArchitecture night={night} />
      <ambientLight intensity={night ? 0.55 : 0.8} />
      <hemisphereLight args={[night ? '#a6bce9' : '#fff3da', '#798b72', 0.65]} />
      <RoomAtmosphere reducedMotion={props.reducedMotion} night={night} accent={colors.accent} />
      <RoomFurnishings reducedMotion={props.reducedMotion} night={night} accent={colors.accent} />
      <directionalLight
        position={[2, 12, 7]}
        intensity={night ? 0.9 : 2.7}
        color={night ? '#becfeb' : '#fff3dc'}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-normalBias={0.04}
        shadow-bias={-0.0001}
        shadow-radius={3}
      />
      <Box at={[0, 0, 0]} size={[12.7, 0.45, 9.8]} color="#bba07a" />
      <Box at={[0, 0.24, 0]} size={[12.5, 0.04, 9.6]} color={theme.floor} finish="wood" />
      {Array.from({ length: 13 }, (_, i) => (
        <Box key={i} at={[-6 + i, 0.269, 0]} size={[0.022, 0.006, 9.4]} color="#bfaa87" />
      ))}
      <Box at={[0, 1.7, -4.88]} size={[12.7, 3.1, 0.3]} color={theme.wall} finish="plaster" />
      <Box at={[-6.38, 1.7, 0]} size={[0.3, 3.1, 9.8]} color={theme.wall} finish="plaster" />
      <Box at={[0, 0.45, -4.67]} size={[12.5, 0.3, 0.12]} color="#b79b76" />
      <Box at={[-6.17, 0.45, 0]} size={[0.12, 0.3, 9.6]} color="#b79b76" />
      <Box at={[0, 3.3, -4.8]} size={[12.8, 0.12, 0.24]} color={colors.accent} />
      <Box at={[-2.05, 2.45, -4.63]} size={[0.8, 0.95, 0.1]} color="#a58a65" />
      <Box at={[-2.05, 2.45, -4.56]} size={[0.65, 0.8, 0.03]} color="#f7edda" />
      <Box
        at={[-2.05, 2.45, -4.53]}
        size={[0.34, 0.43, 0.02]}
        color={['#be866b', '#83996d', '#9c91aa'][seed(props.identity) % 3]}
      />
      <Box at={[0, 0.279, 0.7]} size={[4.6, 0.025, 3.4]} color={colors.accent} />
      <Box at={[0, 0.294, 0.7]} size={[4.25, 0.008, 3.05]} color={colors.light} />
      <Box at={[0, 0.3, 0.7]} size={[3.9, 0.008, 2.7]} color={colors.grass} finish="fabric" />
      <Box at={[4.6, 2.15, -4.65]} size={[1.7, 1.5, 0.12]} color="#a58a65" />
      <Box at={[4.6, 2.15, -4.57]} size={[1.48, 1.28, 0.04]} color={colors.water} />
      <Box at={[4.6, 2.15, -4.5]} size={[0.07, 1.35, 0.05]} color="#fff0d1" />
      <Box at={[4.6, 2.15, -4.5]} size={[1.55, 0.07, 0.05]} color="#fff0d1" />
      {roomDecor(props.building).map((tile, i) => (
        <Box
          key={'decor' + i}
          at={[
            1.7 + (tile.x + tile.w / 2 - 50) / 45,
            2.2 - (tile.y + tile.h / 2 - 34) / 45,
            -4.6 + i * 0.0005,
          ]}
          size={[tile.w / 45, tile.h / 45, 0.02]}
          color={tile.color}
        />
      ))}
      {STATIONS.map((s, i) => (
        <group
          key={s.id}
          position={[s.x, 0.26, s.y]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(i);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(-1);
            document.body.style.cursor = '';
          }}
          onClick={(e) => {
            e.stopPropagation();
            props.onInteract(i);
          }}
        >
          {hovered === i && (
            <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.25, 1.31, 48]} />
              <meshBasicMaterial
                color={night ? '#f4d8a4' : colors.accent}
                transparent
                opacity={0.8}
                depthWrite={false}
              />
            </mesh>
          )}
          {i === 0 ? (
            <>
              <Box at={[0, 1.8, 0]} size={[s.width, 1.55, 0.16]} color="#8d704e" />
              <Box at={[0, 1.8, 0.1]} size={[s.width - 0.16, 1.38, 0.06]} color="#b89c70" />
              <Box at={[-0.4, 1.9, 0.15]} size={[0.85, 0.92, 0.025]} color="#fff0cd" />
              <Box at={[0.65, 1.7, 0.15]} size={[0.6, 0.65, 0.025]} color={colors.light} />
              {[-0.8, 0.8].map((x) => (
                <Box key={x} at={[x, 0.6, 0]} size={[0.1, 1.2, 0.18]} color="#91724f" />
              ))}
              {[0, 1, 2].map((j) => (
                <Box
                  key={j}
                  at={[-0.4, 2.1 - j * 0.2, 0.18]}
                  size={[0.6, 0.035, 0.01]}
                  color="#b99f76"
                />
              ))}
            </>
          ) : i === 1 ? (
            <>
              <Box at={[0, 1.2, 0]} size={[s.width, 2.4, 0.65]} color="#836548" />
              {[0.55, 1.3, 2.05].map((y, row) => (
                <group key={y}>
                  <Box at={[0, y - 0.33, 0.15]} size={[2, 0.06, 0.8]} color="#bc9c72" />
                  {Array.from({ length: 9 }, (_, j) => (
                    <Box
                      key={j}
                      at={[-0.85 + j * 0.21, y, 0.37]}
                      size={[0.16, 0.45 + (seed(props.identity + row + j) % 12) / 100, 0.4]}
                      color={[colors.grass, colors.roof, '#c8ac6f', '#829f9b'][j % 4]}
                    />
                  ))}
                </group>
              ))}
            </>
          ) : (
            <>
              <Box
                at={[0, 0.95, 0]}
                size={[s.width, 0.16, s.depth]}
                color="#c1a176"
                finish="wood"
              />
              {[-1, 1].flatMap((x) =>
                [-1, 1].map((z) => (
                  <Box
                    key={`${x},${z}`}
                    at={[x * (s.width / 2 - 0.15), 0.45, z * (s.depth / 2 - 0.15)]}
                    size={[0.12, 0.9, 0.12]}
                    color="#947653"
                  />
                )),
              )}
              <Box at={[0, 1.2, -0.2]} size={[0.12, 0.4, 0.1]} color="#566b60" />
              <Box at={[0, 1.75, -0.2]} size={[1.5, 0.95, 0.13]} color="#42564d" />
              <Box
                at={[0, 1.75, -0.12]}
                size={[1.34, 0.79, 0.025]}
                color={i === 2 ? '#203e36' : colors.water}
              />
              {i === 2 ? (
                [0, 1, 2].map((j) => (
                  <Box
                    key={j}
                    at={[-0.1, 1.98 - j * 0.2, -0.1]}
                    size={[0.9 - j * 0.15, 0.035, 0.02]}
                    color={j % 2 ? '#e2c382' : '#9ac190'}
                  />
                ))
              ) : (
                <Box at={[0, 1.75, -0.09]} size={[0.8, 0.4, 0.025]} color="#f7e9c8" />
              )}
              <Box at={[0, 1.05, 0.4]} size={[1.1, 0.035, 0.35]} color="#e8dabd" />
            </>
          )}
          <Html position={[0, i === 1 ? 3 : 2.9, 0]} center zIndexRange={[10, 0]}>
            <button
              className={'room-object-label' + (hovered === i ? ' is-active' : '')}
              aria-label={`Open ${s.title}`}
              title={s.caption}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(-1)}
              onClick={(e) => {
                e.stopPropagation();
                props.onInteract(i);
              }}
            >
              {s.short}
            </button>
          </Html>
        </group>
      ))}
      <group position={[-5.2, 0.28, 3.2]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.38, 0.27, 0.6, 8]} />
          <meshStandardMaterial color="#b58361" />
        </mesh>
        <Box at={[0, 0.9, 0]} size={[0.06, 1.2, 0.06]} color="#6e8055" />
        {[
          [-0.3, 1.15, 0],
          [0.3, 1.6, 0],
          [0, 1.85, 0],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]} scale={[0.5, 0.25, 0.35]}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={i % 2 ? colors.light : colors.grass} />
          </mesh>
        ))}
      </group>
      <group
        position={[0, 0.3, 4.2]}
        onClick={(e) => {
          e.stopPropagation();
          props.onInteract(4);
        }}
      >
        <Box at={[0, 0, 0]} size={[1.9, 0.05, 0.8]} color="#9c8460" />
        <Html position={[0, 0.25, 0]} center zIndexRange={[10, 0]}>
          <button className="room-object-label" onClick={() => props.onInteract(4)}>
            Exit ↓
          </button>
        </Html>
      </group>
      <Explorer props={props} />
    </>
  );
}
export default function ThreeRoom(props: RoomSceneProps) {
  const [zoom, setZoom] = useState(1),
    [angle, setAngle] = useState(0),
    [overview, setOverview] = useState(false),
    [reset, setReset] = useState(0);
  return (
    <div className="three-room-stage">
      <Canvas
        shadows
        camera={{ position: [11, 10, 16], fov: ROOM_FOV, near: 0.1, far: 250 }}
        dpr={[1, 1.5]}
        fallback={
          <p className="room-graphics-note">
            3D graphics are unavailable. Return to the island and choose Pixel island.
          </p>
        }
      >
        <Room {...props} zoom={zoom} angle={angle} overview={overview} reset={reset} />
      </Canvas>
      <div className="room-look-hint">Drag to look around · Scroll or pinch to zoom</div>
      <div className="room-camera-tools" role="group" aria-label="Room camera">
        <button
          aria-label={overview ? 'Enter immersive room view' : 'Show whole room'}
          title={overview ? 'Immersive view' : 'Whole room'}
          aria-pressed={overview}
          onClick={() => {
            setOverview((v) => !v);
            setZoom(1);
          }}
        >
          {overview ? <Footprints size={17} /> : <Scan size={17} />}
        </button>
        <button
          aria-label="Zoom into room"
          title="Zoom in"
          disabled={zoom >= 1.5}
          onClick={() => setZoom((z) => Math.min(1.5, z + 0.15))}
        >
          <ZoomIn size={17} />
        </button>
        <button
          aria-label="Zoom out of room"
          title="Zoom out"
          disabled={zoom <= 1}
          onClick={() => setZoom((z) => Math.max(1, z - 0.15))}
        >
          <ZoomOut size={17} />
        </button>
        <button
          aria-label="Change room viewing angle"
          title="Change viewing angle"
          onClick={() => setAngle((a) => (a === 0 ? -0.2 : a < 0 ? 0.2 : 0))}
        >
          <MoveHorizontal size={17} />
        </button>
        <button
          aria-label="Reset room camera"
          title="Reset immersive view"
          onClick={() => {
            setZoom(1);
            setAngle(0);
            setOverview(false);
            setReset((n) => n + 1);
          }}
        >
          <RotateCcw size={17} />
        </button>
      </div>
    </div>
  );
}
