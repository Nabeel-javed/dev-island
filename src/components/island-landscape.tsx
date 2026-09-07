'use client';
import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { grassPositions } from '@/lib/landscape';
import { useGraphics, GRAPHICS } from './graphics-settings';
import RoomMaterial from './room-material';
export default function IslandLandscape({ still, grass }: { still: boolean; grass: string }) {
  const { level } = useGraphics();
  const mesh = useRef<THREE.InstancedMesh>(null),
    rocks = useRef<THREE.InstancedMesh>(null);
  const positions = useMemo(() => grassPositions(GRAPHICS[level].blades), [level]);
  const time = useMemo(() => ({ value: 0 }), []);
  const blade = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(
        [
          -0.035, 0, 0, 0.035, 0, 0, 0.018, 0.18, 0, -0.035, 0, 0, 0.018, 0.18, 0, -0.018, 0.18, 0,
          -0.018, 0.18, 0, 0.018, 0.18, 0, 0.035, 0.34, 0,
        ],
        3,
      ),
    );
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  useEffect(() => () => blade.dispose(), [blade]);
  useEffect(() => {
    if (!mesh.current) return;
    const object = new THREE.Object3D(),
      color = new THREE.Color();
    positions.forEach((p, i) => {
      object.position.set(p.x, 0.25, p.z);
      object.rotation.set(0, p.rotation, 0);
      object.scale.setScalar(p.height);
      object.updateMatrix();
      mesh.current!.setMatrixAt(i, object.matrix);
      color.set(grass).multiplyScalar(0.65 + (i % 7) * 0.055);
      mesh.current!.setColorAt(i, color);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [positions, grass]);
  useEffect(() => {
    if (!rocks.current) return;
    const object = new THREE.Object3D();
    for (let i = 0; i < 54; i++) {
      const a = i * 2.399;
      object.position.set(
        Math.cos(a) * (9.6 + (i % 3) * 0.13),
        -0.19,
        Math.sin(a) * (6.91 + (i % 3) * 0.09),
      );
      object.rotation.set(i * 0.4, i, 0.3);
      object.scale.set(0.13 + (i % 4) * 0.07, 0.09 + (i % 3) * 0.06, 0.16 + (i % 4) * 0.06);
      object.updateMatrix();
      rocks.current.setMatrixAt(i, object.matrix);
    }
    rocks.current.instanceMatrix.needsUpdate = true;
    rocks.current.computeBoundingSphere();
  }, []);
  useFrame(({ clock }) => {
    time.value = still ? 0 : clock.elapsedTime;
  });
  const compile = useCallback(
    (shader: Parameters<THREE.MeshStandardMaterial['onBeforeCompile']>[0]) => {
      shader.uniforms.uWind = time;
      shader.vertexShader = 'uniform float uWind;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
      vec4 root=instanceMatrix*vec4(0.0,0.0,0.0,1.0);
      transformed.x+=sin(uWind*1.1+root.x*0.7+root.z*0.4)*position.y*position.y*0.8;
    `,
      );
    },
    [time],
  );
  return (
    <>
      <instancedMesh
        key={level}
        ref={mesh}
        args={[blade, undefined, positions.length]}
        receiveShadow
        frustumCulled={false}
      >
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.95}
          side={THREE.DoubleSide}
          onBeforeCompile={compile}
          customProgramCacheKey={() => 'meadow-wind-v1'}
        />
      </instancedMesh>
      <instancedMesh ref={rocks} args={[undefined, undefined, 54]} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <RoomMaterial color="#a7aaa0" finish="stone" />
      </instancedMesh>
    </>
  );
}
