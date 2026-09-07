'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { seed } from '@/lib/island';

export default function RoomAtmosphere({
  reducedMotion,
  night,
  accent,
}: {
  reducedMotion: boolean;
  night: boolean;
  accent: string;
}) {
  const curtains = useRef<THREE.Group>(null),
    lamp = useRef<THREE.Group>(null),
    hand = useRef<THREE.Group>(null),
    dust = useRef<THREE.Points>(null);
  const particles = useMemo(
    () =>
      new Float32Array(
        Array.from({ length: 24 }, (_, i) => [
          3.2 + (seed('room-dust-x' + i) % 230) / 100,
          0.8 + (seed('room-dust-y' + i) % 170) / 100,
          -4 + (seed('room-dust-z' + i) % 190) / 100,
        ]).flat(),
      ),
    [],
  );
  useFrame(({ clock }) => {
    const time = reducedMotion ? 0 : clock.elapsedTime;
    curtains.current?.children.forEach((curtain, i) => {
      curtain.rotation.x = Math.sin(time * 0.65 + i) * 0.065;
    });
    if (lamp.current) lamp.current.rotation.z = Math.sin(time * 0.48) * 0.035;
    if (hand.current) hand.current.rotation.z = (-time * Math.PI) / 30;
    if (dust.current) {
      dust.current.position.y = Math.sin(time * 0.23) * 0.16;
      dust.current.position.x = Math.sin(time * 0.17) * 0.1;
    }
  });
  return (
    <>
      <group ref={curtains}>
        {[3.8, 5.4].map((x, i) => (
          <group key={x} position={[x, 2.86, -4.42]}>
            {[0, 1, 2].map((j) => (
              <mesh key={j} position={[(j - 1) * 0.09, -0.66, (j % 2) * 0.055]} castShadow>
                <boxGeometry args={[0.1, 1.34 - j * 0.025, 0.035]} />
                <meshStandardMaterial color={i ? '#e3dbc5' : '#efe4cb'} roughness={1} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      <mesh position={[4.6, 2.93, -4.39]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 2.2, 8]} />
        <meshStandardMaterial color="#806d51" />
      </mesh>
      <group ref={lamp} position={[2.1, 3.6, -2]}>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.7, 6]} />
          <meshStandardMaterial color="#625e4b" />
        </mesh>
        <mesh position={[0, -0.82, 0]} castShadow>
          <coneGeometry args={[0.38, 0.35, 12, 1, true]} />
          <meshStandardMaterial color={accent} side={THREE.DoubleSide} roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.94, 0]}>
          <sphereGeometry args={[0.09, 12, 8]} />
          <meshStandardMaterial
            color="#fff2d1"
            emissive="#ffd79a"
            emissiveIntensity={night ? 2 : 0.2}
          />
        </mesh>
        <pointLight
          position={[0, -1, 0]}
          color="#ffd79a"
          intensity={night ? 18 : 2}
          distance={10}
          decay={2}
        />
      </group>
      <group position={[-1, 2.92, -4.64]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.08, 32]} />
          <meshStandardMaterial color="#997d59" />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <circleGeometry args={[0.275, 32]} />
          <meshStandardMaterial color="#f4edda" />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[
              Math.sin((i * Math.PI) / 2) * 0.22,
              Math.cos((i * Math.PI) / 2) * 0.22,
              0.058,
            ]}
          >
            <circleGeometry args={[0.018, 8]} />
            <meshBasicMaterial color="#607563" />
          </mesh>
        ))}
        <mesh position={[0.05, 0.05, 0.062]} rotation={[0, 0, -0.75]}>
          <boxGeometry args={[0.025, 0.15, 0.01]} />
          <meshBasicMaterial color="#415749" />
        </mesh>
        <group ref={hand} position={[0, 0, 0.075]}>
          <mesh position={[0, 0.09, 0]}>
            <boxGeometry args={[0.014, 0.2, 0.01]} />
            <meshBasicMaterial color="#b0855e" />
          </mesh>
        </group>
      </group>
      <points ref={dust}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#fff2ce"
          size={0.025}
          transparent
          opacity={night ? 0.2 : 0.45}
          depthWrite={false}
        />
      </points>
    </>
  );
}
