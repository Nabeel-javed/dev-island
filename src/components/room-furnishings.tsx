'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { STATIONS } from '@/lib/room';
function Piece({
  at,
  size,
  color,
}: {
  at: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <RoundedBox
      position={at}
      args={size}
      radius={Math.min(...size) * 0.15}
      smoothness={2}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.75} />
    </RoundedBox>
  );
}
function DeskDetails({
  index,
  accent,
  still,
  night,
}: {
  index: number;
  accent: string;
  still: boolean;
  night: boolean;
}) {
  const station = STATIONS[index],
    indicator = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (indicator.current)
      (indicator.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        (night ? 0.8 : 0.25) + (still ? 0 : (Math.sin(clock.elapsedTime * 1.3) + 1) * 0.12);
  });
  return (
    <group position={[station.x, 0.26, station.y]}>
      <Piece at={[-0.68, 0.52, 0.38]} size={[0.52, 0.12, 0.46]} color={accent} />
      <Piece at={[-0.68, 0.86, 0.57]} size={[0.52, 0.67, 0.1]} color={accent} />
      <Piece at={[-0.68, 0.22, 0.38]} size={[0.075, 0.45, 0.075]} color="#5c6c63" />
      <Piece at={[-0.68, 0.035, 0.38]} size={[0.5, 0.07, 0.36]} color="#5c6c63" />
      <group position={[0.8, 1.08, 0.25]}>
        <mesh position={[0, 0.095, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.075, 0.19, 16]} />
          <meshStandardMaterial color="#f0e3c7" />
        </mesh>
        <mesh position={[0, 0.194, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.065, 16]} />
          <meshStandardMaterial color="#684735" />
        </mesh>
        <mesh position={[0.09, 0.11, 0]}>
          <torusGeometry args={[0.055, 0.015, 6, 12]} />
          <meshStandardMaterial color="#f0e3c7" />
        </mesh>
      </group>
      {[0, 1, 2, 3].map((row) =>
        Array.from({ length: 9 }, (_, key) => (
          <mesh key={`${row}:${key}`} position={[-0.46 + key * 0.105, 1.075, 0.285 + row * 0.075]}>
            <boxGeometry args={[0.075, 0.015, 0.047]} />
            <meshStandardMaterial color="#8a9c8e" />
          </mesh>
        )),
      )}
      <mesh ref={indicator} position={[0.6, 1.4, -0.115]}>
        <sphereGeometry args={[0.022, 8, 6]} />
        <meshStandardMaterial color="#a9d1a3" emissive="#8ed4a1" />
      </mesh>
      <Piece at={[0.72, 1.14, -0.43]} size={[0.22, 0.3, 0.22]} color="#b9bda7" />
      <mesh position={[0.72, 1.43, -0.43]} castShadow>
        <icosahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color="#6a9468" flatShading />
      </mesh>
    </group>
  );
}
export default function RoomFurnishings({
  accent,
  night,
  reducedMotion,
}: {
  accent: string;
  night: boolean;
  reducedMotion: boolean;
}) {
  return (
    <>
      {[2, 3].map((index) => (
        <DeskDetails
          key={index}
          index={index}
          accent={accent}
          still={reducedMotion}
          night={night}
        />
      ))}
      {/* This alcove stays inside the existing blocked plant corner. */}
      <group position={[-5.25, 0.28, 3.9]}>
        <Piece at={[0, 0.32, 0]} size={[1.05, 0.5, 0.75]} color="#92765b" />
        <Piece at={[0, 0.63, 0]} size={[1.04, 0.16, 0.72]} color={accent} />
        <Piece at={[-0.43, 0.94, 0]} size={[0.15, 0.57, 0.76]} color={accent} />
        <Piece at={[0.05, 0.81, 0.12]} size={[0.4, 0.2, 0.34]} color="#e2c49e" />
      </group>
      <group position={[-6.07, 2.1, 0.7]}>
        <Piece at={[0, 0, 0]} size={[0.25, 0.12, 2.6]} color="#ac8f6b" />
        {[-0.8, -0.55, -0.3].map((z, i) => (
          <Piece
            key={z}
            at={[0, 0.32, z]}
            size={[0.22, 0.5 + i * 0.04, 0.18]}
            color={['#869f8e', '#cba374', '#a494b3'][i]}
          />
        ))}
        <mesh position={[0, 0.3, 0.75]} castShadow>
          <sphereGeometry args={[0.21, 12, 8]} />
          <meshStandardMaterial color="#c9b895" roughness={0.65} />
        </mesh>
      </group>
      <mesh position={[0, -0.32, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <shadowMaterial opacity={night ? 0.2 : 0.12} transparent depthWrite={false} />
      </mesh>
    </>
  );
}
