'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Moving details live above existing station footprints, away from walking paths. */
export default function RoomActivity({
  reducedMotion,
  night,
}: {
  reducedMotion: boolean;
  night: boolean;
}) {
  const model = useRef<THREE.Group>(null);
  const bars = useRef<THREE.Group>(null);
  const pages = useRef<THREE.Group>(null);
  const steam = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = reducedMotion ? 0 : clock.elapsedTime;
    if (model.current) {
      model.current.rotation.y = t * 0.55;
      model.current.position.y = 3.25 + Math.sin(t * 1.4) * 0.12;
    }
    bars.current?.children.forEach((bar, i) => {
      bar.scale.y = 0.35 + (Math.sin(t * 2.8 + i * 0.7) + 1) * 0.32;
    });
    if (pages.current) pages.current.rotation.z = -0.2 + Math.sin(t * 0.8) * 0.17;
    steam.current?.children.forEach((puff, i) => {
      const phase = (t * 0.25 + i / 5) % 1;
      puff.position.set(Math.sin(phase * 5 + i) * 0.04, phase * 0.6, 0);
      puff.scale.setScalar(0.4 + phase * 1.4);
      (puff as THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>).material.opacity =
        (1 - phase) * 0.2;
    });
  });
  return (
    <>
      <group ref={model} position={[3.7, 3.25, -2.2]}>
        <mesh rotation={[0.4, 0, 0.4]}>
          <icosahedronGeometry args={[0.34, 0]} />
          <meshStandardMaterial
            color="#93dfce"
            emissive="#3ab99a"
            emissiveIntensity={night ? 1.2 : 0.4}
            metalness={0.4}
            roughness={0.2}
            wireframe
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.48, 0.018, 6, 40]} />
          <meshStandardMaterial color="#afd6bb" emissive="#3ab99a" emissiveIntensity={0.45} />
        </mesh>
      </group>
      <group ref={bars} position={[3.45, 1.78, 1.54]}>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[i * 0.135, 0, 0]}>
            <boxGeometry args={[0.07, 0.52, 0.025]} />
            <meshStandardMaterial
              color={i % 3 ? '#83c6b2' : '#f1cb89'}
              emissive="#62ad9a"
              emissiveIntensity={night ? 0.9 : 0.25}
            />
          </mesh>
        ))}
      </group>
      <group position={[-0.55, 2.72, -3.05]} rotation={[0.35, 0, 0]}>
        <mesh position={[0.26, 0, 0]}>
          <boxGeometry args={[0.52, 0.06, 0.5]} />
          <meshStandardMaterial color="#f2dfb4" />
        </mesh>
        <group ref={pages}>
          <mesh position={[-0.26, 0, 0]}>
            <boxGeometry args={[0.52, 0.045, 0.5]} />
            <meshStandardMaterial color="#fff1d1" />
          </mesh>
        </group>
      </group>
      <group ref={steam} position={[4.5, 1.64, -1.95]}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.045, 8, 6]} />
            <meshBasicMaterial color="#fff1dc" transparent opacity={0.15} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}
