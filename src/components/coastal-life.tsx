'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
function Butterfly({ index, still }: { index: number; still: boolean }) {
  const body = useRef<THREE.Group>(null),
    wings = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = still ? 0 : clock.elapsedTime;
    if (body.current) {
      body.current.position.set(
        -3.6 + Math.sin(t * 0.34 + index) * 0.9,
        0.7 + Math.sin(t * 0.7 + index) * 0.18,
        4.55 + Math.cos(t * 0.28 + index) * 0.45,
      );
      body.current.rotation.y = t * 0.3 + index;
    }
    wings.current?.children.forEach((wing, i) => {
      wing.rotation.z = (i ? -1 : 1) * (0.5 + Math.sin(t * 10 + index) * 0.65);
    });
  });
  return (
    <group ref={body}>
      <mesh scale={[0.025, 0.025, 0.1]}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshStandardMaterial color="#746144" />
      </mesh>
      <group ref={wings}>
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh position={[side * 0.08, 0, 0]} scale={[0.105, 0.018, 0.09]}>
              <sphereGeometry args={[1, 8, 6]} />
              <meshStandardMaterial color={index ? '#e7c484' : '#d3b9d0'} roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
export default function CoastalLife({ still, night }: { still: boolean; night: boolean }) {
  const reeds = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = still ? 0 : clock.elapsedTime;
    reeds.current?.children.forEach((clump, i) => {
      clump.rotation.z = Math.sin(t * 0.9 + i * 1.6) * 0.07;
    });
  });
  return (
    <>
      {!night && [0, 1].map((index) => <Butterfly key={index} index={index} still={still} />)}
      <group ref={reeds}>
        {[
          [-7.8, 1.7],
          [-7.5, 2.1],
          [7.4, -2.4],
          [7.1, -2.8],
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0.25, z]}>
            {[-1, 0, 1].map((side, j) => (
              <group key={side} rotation={[side * 0.12, j * 1.8, side * 0.14]}>
                <mesh position={[side * 0.08, 0.3, 0]} castShadow>
                  <cylinderGeometry args={[0.012, 0.025, 0.6 + j * 0.07, 5]} />
                  <meshStandardMaterial color="#81965e" />
                </mesh>
                <mesh
                  position={[side * 0.08, 0.64 + j * 0.035, 0]}
                  scale={[0.065, 0.14, 0.055]}
                  castShadow
                >
                  <sphereGeometry args={[1, 6, 5]} />
                  <meshStandardMaterial color="#d0b47b" roughness={1} />
                </mesh>
              </group>
            ))}
          </group>
        ))}
      </group>
    </>
  );
}
