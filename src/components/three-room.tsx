'use client';
import { Canvas, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';
import { PALETTES, seed } from '@/lib/island';
import { STATIONS } from '@/lib/room';
import { Explorer } from './three-island';
import type { RoomSceneProps } from './room-scene-types';
function Box({
  at,
  size,
  color,
}: {
  at: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={at} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}
function Camera() {
  const { camera, size } = useThree();
  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = Math.min(size.width / 18, size.height / 15);
      camera.lookAt(0, 0.2, 0);
      camera.updateProjectionMatrix();
    }
  }, [camera, size]);
  return null;
}
function Room(props: RoomSceneProps) {
  const colors = PALETTES[props.palette];
  return (
    <>
      <Camera />
      <ambientLight intensity={1.4} />
      <directionalLight
        position={[2, 12, 7]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-normalBias={0.04}
      />
      <Box at={[0, 0, 0]} size={[12.7, 0.45, 9.8]} color="#bba07a" />
      <Box at={[0, 0.24, 0]} size={[12.5, 0.04, 9.6]} color="#dbc5a1" />
      {Array.from({ length: 13 }, (_, i) => (
        <Box key={i} at={[-6 + i, 0.269, 0]} size={[0.022, 0.006, 9.4]} color="#bfaa87" />
      ))}
      <Box at={[0, 1.7, -4.8]} size={[12.7, 3.1, 0.16]} color="#ebe4d2" />
      <Box at={[-6.3, 1.7, 0]} size={[0.16, 3.1, 9.8]} color="#ddd7c3" />
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
      <Box at={[0, 0.3, 0.7]} size={[3.9, 0.008, 2.7]} color={colors.grass} />
      <Box at={[4.6, 2.15, -4.65]} size={[1.7, 1.5, 0.12]} color="#a58a65" />
      <Box at={[4.6, 2.15, -4.57]} size={[1.48, 1.28, 0.04]} color={colors.water} />
      <Box at={[4.6, 2.15, -4.5]} size={[0.07, 1.35, 0.05]} color="#fff0d1" />
      <Box at={[4.6, 2.15, -4.5]} size={[1.55, 0.07, 0.05]} color="#fff0d1" />
      {STATIONS.map((s, i) => (
        <group
          key={s.id}
          position={[s.x, 0.26, s.y]}
          onClick={(e) => {
            e.stopPropagation();
            props.onInteract(i);
          }}
        >
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
              <Box at={[0, 0.95, 0]} size={[s.width, 0.16, s.depth]} color="#c1a176" />
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
              className="room-object-label"
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
  return (
    <Canvas
      orthographic
      shadows
      camera={{ position: [11, 14, 18], near: 0.1, far: 100 }}
      dpr={[1, 1.5]}
      fallback={
        <p className="room-graphics-note">Explore this project using the station buttons below.</p>
      }
    >
      <Room {...props} />
    </Canvas>
  );
}
