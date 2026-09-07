'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLOTS, type Island } from '@/lib/island';
import { buildingFor } from '@/lib/buildings';

function Smoke({ x, z, still }: { x: number; z: number; still: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    group.current?.children.forEach((child, i) => {
      const phase = ((still ? 0 : clock.elapsedTime * 0.16) + i / 5) % 1;
      child.position.set(phase * 0.65, phase * 1.65, Math.sin(phase * 3) * 0.14);
      child.scale.setScalar(0.1 + phase * 0.28);
      ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity =
        Math.sin(phase * Math.PI) * 0.25;
    });
  });
  return (
    <group ref={group} position={[x + 0.68, 3.07, z - 0.42]}>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#efeadc" transparent depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
function Gull({ index, still }: { index: number; still: boolean }) {
  const bird = useRef<THREE.Group>(null),
    wings = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const time = still ? 0 : clock.elapsedTime;
    const angle = time * 0.09 + index * 2.1;
    if (bird.current) {
      bird.current.position.set(
        Math.cos(angle) * 9,
        5.1 + index * 0.45 + Math.sin(angle * 2) * 0.3,
        Math.sin(angle) * 6,
      );
      bird.current.rotation.y = -angle;
    }
    wings.current?.children.forEach((wing, i) => {
      wing.rotation.z = (i ? -1 : 1) * (0.16 + Math.sin(time * 3.4 + index) * 0.28);
    });
  });
  return (
    <group ref={bird}>
      <mesh scale={[0.07, 0.07, 0.24]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#f4efdf" />
      </mesh>
      <group ref={wings}>
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh
              position={[side * 0.18, 0, 0]}
              scale={[0.23, 0.025, 0.095]}
              rotation={[0, side * 0.22, 0]}
            >
              <sphereGeometry args={[1, 6, 4]} />
              <meshStandardMaterial color="#ebe6d8" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
export default function IslandAtmosphere({
  island,
  reducedMotion,
  night,
}: {
  island: Island;
  reducedMotion: boolean;
  night: boolean;
}) {
  return (
    <>
      {!night && [0, 1].map((i) => <Gull key={i} index={i} still={reducedMotion} />)}
      {island.projects.map((project, i) =>
        ['cottage', 'cafe'].includes(buildingFor(project)) ? (
          <Smoke key={project.id} x={PLOTS[i].x} z={PLOTS[i].y} still={reducedMotion} />
        ) : null,
      )}
      {[
        [-8.2, 3.8, 0.5],
        [-7.7, 4.2, 0.3],
        [8.8, 0.8, 0.45],
        [8.5, 1.4, 0.28],
        [-3.8, -6.3, 0.38],
      ].map(([x, z, scale], i) => (
        <mesh
          key={i}
          position={[x, -0.08, z]}
          scale={[scale, scale * 0.65, scale * 0.85]}
          rotation={[0.2, i, 0.1]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={i % 2 ? '#b5b7a6' : '#949e94'} roughness={1} flatShading />
        </mesh>
      ))}
    </>
  );
}
