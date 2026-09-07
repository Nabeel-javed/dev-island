'use client';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { seed } from '@/lib/island';
export default function NightAtmosphere({ reducedMotion }: { reducedMotion: boolean }) {
  const flies = useRef<THREE.Points>(null);
  const stars = useMemo(
    () =>
      new Float32Array(
        Array.from({ length: 55 }, (_, i) => [
          (seed('sx' + i) % 500) / 10 - 25,
          7 + (seed('sy' + i) % 130) / 10,
          -12 - (seed('sz' + i) % 150) / 10,
        ]).flat(),
      ),
    [],
  );
  const fireflies = useMemo(
    () =>
      new Float32Array(
        Array.from({ length: 20 }, (_, i) => [
          (seed('fx' + i) % 130) / 10 - 6.5,
          0.6 + (seed('fy' + i) % 15) / 10,
          1 + (seed('fz' + i) % 45) / 10,
        ]).flat(),
      ),
    [],
  );
  useFrame(({ clock }) => {
    if (flies.current)
      flies.current.position.y = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.65) * 0.16;
  });
  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stars, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#e6e9d8"
          size={0.07}
          sizeAttenuation
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </points>
      <points ref={flies}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[fireflies, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#e8e99a"
          size={0.065}
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </points>
      <mesh position={[-9, 11, -16]}>
        <sphereGeometry args={[0.8, 16, 12]} />
        <meshBasicMaterial color="#f0e2b5" />
      </mesh>
      {[-1, 3.6, 6.3].flatMap((z, i) =>
        [-1, 1].map((x) => (
          <group key={`${x}:${z}`} position={[x, 0.25, z]}>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.045, 0.06, 1.2, 6]} />
              <meshStandardMaterial color="#9f9677" />
            </mesh>
            <mesh position={[0, 1.3, 0]}>
              <boxGeometry args={[0.26, 0.32, 0.26]} />
              <meshStandardMaterial color="#ffe0a1" emissive="#ffd481" emissiveIntensity={1.6} />
            </mesh>
            <mesh position={[0, 1.49, 0]}>
              <coneGeometry args={[0.24, 0.17, 4]} />
              <meshStandardMaterial color="#718482" />
            </mesh>
            {x === -1 && i !== 0 && (
              <pointLight
                position={[0, 1.35, 0]}
                color="#ffd18b"
                intensity={7}
                distance={6}
                decay={2}
              />
            )}
          </group>
        )),
      )}
    </>
  );
}
