'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { AVATARS, PALETTES, PLOTS, TREES, seed, type Day } from '@/lib/island';
import type { SceneProps as BaseSceneProps } from './pixel-island';
import { trailerFrame } from '@/lib/trailer';
type SceneProps = BaseSceneProps & { cinematic?: RefObject<number> };
const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
function Box({
  position,
  size,
  color,
  ...rest
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} {...rest} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}
function Tree({
  x,
  z,
  index,
  color,
  motion,
}: {
  x: number;
  z: number;
  index: number;
  color: string;
  motion: boolean;
}) {
  const crown = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (crown.current && motion)
      crown.current.rotation.z = Math.sin(clock.elapsedTime * 0.7 + index) * 0.018;
  });
  return (
    <group position={[x, 0.22, z]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.17, 1.2, 6]} />
        <meshStandardMaterial color="#90704e" />
      </mesh>
      <group ref={crown}>
        <mesh position={[0, 1.55, 0]} castShadow>
          <icosahedronGeometry args={[0.85, 1]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
        <mesh position={[-0.28, 2.13, 0]} castShadow>
          <icosahedronGeometry args={[0.65, 1]} />
          <meshStandardMaterial color="#90ae78" flatShading />
        </mesh>
        <mesh position={[0.48, 1.75, 0.15]} castShadow>
          <icosahedronGeometry args={[0.58, 0]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      </group>
    </group>
  );
}
function House({ index, props }: { index: number; props: SceneProps }) {
  const p = PLOTS[index],
    project = props.island.projects[index];
  const colors = [
    PALETTES[props.palette].roof,
    '#6d9893',
    '#91a275',
    '#c2a576',
    '#a294b1',
    '#849fa9',
  ];
  const roof = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.3, 0);
    shape.lineTo(0, 1.05);
    shape.lineTo(1.3, 0);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 2.25, bevelEnabled: false });
  }, []);
  useEffect(() => () => roof.dispose(), [roof]);
  return (
    <group
      position={[p.x, 0.22, p.y]}
      onClick={(e) => {
        e.stopPropagation();
        props.onSelect(index);
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = '';
      }}
    >
      <Box position={[0, 0.06, 0]} size={[2.65, 0.14, 2.3]} color="#d6c79f" />
      <Box position={[0, 0.9, 0]} size={[2.2, 1.7, 1.9]} color="#f2e8ce" />
      <mesh geometry={roof} position={[0, 1.8, -1.125]} castShadow receiveShadow>
        <meshStandardMaterial color={colors[index]} roughness={0.9} />
      </mesh>
      <Box position={[0.68, 2.3, -0.42]} size={[0.27, 0.9, 0.3]} color="#c0ab91" />
      <Box position={[0.68, 2.78, -0.42]} size={[0.36, 0.12, 0.39]} color="#e3d7bc" />
      <Box position={[0, 0.53, 0.97]} size={[0.44, 1.04, 0.07]} color="#877557" />
      <mesh position={[0.12, 0.52, 1.02]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshStandardMaterial color="#e5c384" />
      </mesh>
      {[-0.73, 0.73].map((x) => (
        <group key={x}>
          <Box position={[x, 1.06, 0.976]} size={[0.5, 0.62, 0.07]} color="#9cb9b4" />
          <Box position={[x, 1.06, 1.02]} size={[0.035, 0.64, 0.04]} color="#f7efd9" />
          <Box position={[x, 1.06, 1.02]} size={[0.52, 0.035, 0.04]} color="#f7efd9" />
          <Box position={[x, 0.71, 1.02]} size={[0.64, 0.08, 0.18]} color="#bca77e" />
        </group>
      ))}
      <Box position={[1.12, 1.04, 0]} size={[0.05, 0.57, 0.6]} color="#9cb9b4" />
      <Box position={[1.15, 1.04, 0]} size={[0.05, 0.59, 0.035]} color="#f2e8ce" />
      <Box position={[0, 0.02, 1.19]} size={[0.68, 0.14, 0.35]} color="#c4b68f" />
      <mesh position={[-1, 0.2, 1.05]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.35, 8]} />
        <meshStandardMaterial color="#b68a65" />
      </mesh>
      <mesh position={[-1, 0.44, 1.05]} castShadow>
        <icosahedronGeometry args={[0.25, 1]} />
        <meshStandardMaterial color="#6a9366" />
      </mesh>
      <Html position={[0, 3.35, 0]} center zIndexRange={[15, 0]}>
        <button className="house-label" onClick={() => props.onSelect(index)}>
          {project.name}
        </button>
      </Html>
    </group>
  );
}
export function Explorer({
  props,
}: {
  props: Pick<SceneProps, 'avatar' | 'controller' | 'reducedMotion'>;
}) {
  const body = useRef<THREE.Group>(null),
    left = useRef<THREE.Mesh>(null),
    right = useRef<THREE.Mesh>(null);
  const avatar = AVATARS.find((a) => a.id === props.avatar)!;
  useFrame(({ clock }, dt) => {
    const c = props.controller.current;
    c.step(dt);
    if (body.current) {
      body.current.position.set(c.x, 0.26, c.y);
      if (c.moving) body.current.rotation.y = Math.atan2(c.dx, c.dy);
      body.current.position.y +=
        !props.reducedMotion && c.moving ? Math.abs(Math.sin(clock.elapsedTime * 12)) * 0.055 : 0;
    }
    if (left.current && right.current) {
      left.current.rotation.x = c.moving ? Math.sin(clock.elapsedTime * 12) * 0.45 : 0;
      right.current.rotation.x = -left.current.rotation.x;
    }
  });
  return (
    <group ref={body} position={[props.controller.current.x, 0.26, props.controller.current.y]}>
      <mesh position={[-0.105, 0.14, 0]} ref={left} castShadow>
        <boxGeometry args={[0.15, 0.27, 0.2]} />
        <meshStandardMaterial color="#485b56" />
      </mesh>
      <mesh position={[0.105, 0.14, 0]} ref={right} castShadow>
        <boxGeometry args={[0.15, 0.27, 0.2]} />
        <meshStandardMaterial color="#485b56" />
      </mesh>
      <Box position={[0, 0.43, 0]} size={[0.4, 0.4, 0.25]} color={avatar.color} />
      <Box position={[-0.27, 0.4, 0]} size={[0.12, 0.32, 0.15]} color={avatar.skin} />
      <Box position={[0.27, 0.4, 0]} size={[0.12, 0.32, 0.15]} color={avatar.skin} />
      <mesh position={[0, 0.83, 0]} castShadow>
        <boxGeometry args={[0.38, 0.38, 0.34]} />
        <meshStandardMaterial color={avatar.skin} />
      </mesh>
      <Box position={[-0.08, 0.84, 0.178]} size={[0.035, 0.04, 0.02]} color="#334a42" />
      <Box position={[0.08, 0.84, 0.178]} size={[0.035, 0.04, 0.02]} color="#334a42" />
      <mesh position={[0, 1.04, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.3, 0.12, 10]} />
        <meshStandardMaterial
          color={
            props.avatar === 'sailor'
              ? '#f4eddb'
              : props.avatar === 'astronaut'
                ? '#e5e2d6'
                : '#c5a46e'
          }
        />
      </mesh>
      <mesh position={[0, 1.14, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.16, 10]} />
        <meshStandardMaterial
          color={
            props.avatar === 'sailor'
              ? '#f4eddb'
              : props.avatar === 'astronaut'
                ? '#e5e2d6'
                : '#d9b97b'
          }
        />
      </mesh>
    </group>
  );
}
function FitCamera({ cinematic, count }: { cinematic?: RefObject<number>; count: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = Math.min(size.width / 25.5, size.height / 22);
      camera.lookAt(0, 0, 1);
      camera.updateProjectionMatrix();
    }
  }, [camera, size]);
  useFrame(() => {
    if (!cinematic || !(camera instanceof THREE.OrthographicCamera)) return;
    const frame = trailerFrame(cinematic.current, count);
    camera.position.set(...frame.position);
    camera.lookAt(...frame.target);
    camera.zoom = Math.min(size.width / 25.5, size.height / 22) * frame.zoom;
    camera.updateProjectionMatrix();
  });
  return null;
}
function Boat({ motion }: { motion: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current && motion) {
      ref.current.position.y = -0.5 + Math.sin(clock.elapsedTime) * 0.05;
      ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.7) * 0.04;
    }
  });
  return (
    <group ref={ref} position={[1.5, -0.5, 7.9]}>
      <mesh scale={[0.4, 0.24, 0.85]} castShadow>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#a38258" />
      </mesh>
      <Box position={[0, 0.15, 0]} size={[0.55, 0.1, 1.1]} color="#eddbad" />
      <Box position={[0, 0.85, 0]} size={[0.045, 1.4, 0.045]} color="#886e4e" />
      <mesh position={[0.26, 1, 0]}>
        <planeGeometry args={[0.5, 0.7]} />
        <meshStandardMaterial color="#fff3d6" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
function Garden({ days }: { days: Day[] }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!mesh.current) return;
    const transform = new THREE.Object3D(),
      color = new THREE.Color();
    days.slice(-371).forEach((d, i) => {
      const height = 0.07 + Math.min(d.count, 12) * 0.022;
      transform.position.set(
        1.83 + Math.floor(i / 7) * 0.064,
        0.295 + height / 2,
        4.05 + (i % 7) * 0.18,
      );
      transform.scale.set(0.05, height, 0.13);
      transform.updateMatrix();
      mesh.current!.setMatrixAt(i, transform.matrix);
      color.set(
        d.count === 0 ? '#c0b28c' : d.count < 4 ? '#a0b979' : d.count < 8 ? '#6e985c' : '#3f7453',
      );
      mesh.current!.setColorAt(i, color);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [days]);
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, Math.min(days.length, 371)]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.9} />
    </instancedMesh>
  );
}
function World(props: SceneProps) {
  const p = PALETTES[props.palette];
  const ready = useRef(false);
  useFrame(() => {
    if (!ready.current) {
      ready.current = true;
      props.onReady();
    }
  });
  useEffect(
    () => () => {
      document.body.style.cursor = '';
    },
    [],
  );
  return (
    <>
      <color attach="background" args={[p.water]} />
      <fog attach="fog" args={[p.water, 40, 85]} />
      <ambientLight intensity={1.3} />
      <hemisphereLight args={['#fff5dd', '#a0bba5', 1.8]} />
      <directionalLight
        position={[-9, 18, 10]}
        intensity={2.5}
        color="#fff1cf"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-normalBias={0.04}
      />
      <FitCamera cinematic={props.cinematic} count={props.island.projects.length} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={p.water} roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.53, 0]} scale={[1, 0.02, 0.72]}>
        <cylinderGeometry args={[10.9, 10.9, 1, 80]} />
        <meshStandardMaterial color={p.deep} />
      </mesh>
      <mesh position={[0, -0.44, 0]} scale={[1, 0.03, 0.72]}>
        <cylinderGeometry args={[10.45, 10.45, 1, 80]} />
        <meshStandardMaterial color="#d1e2cd" />
      </mesh>
      <mesh position={[0, -0.15, 0]} scale={[1, 1, 0.72]} receiveShadow>
        <cylinderGeometry args={[9.6, 10.1, 0.55, 64]} />
        <meshStandardMaterial color="#e8d5a8" />
      </mesh>
      <mesh position={[0, 0.09, -0.15]} scale={[1, 1, 0.72]} receiveShadow>
        <cylinderGeometry args={[9.15, 9.4, 0.3, 64]} />
        <meshStandardMaterial color={p.grass} />
      </mesh>
      <Box position={[0, 0.25, 1.5]} size={[0.95, 0.025, 10.7]} color="#e0ceaa" />
      <Box position={[0, 0.252, -1.5]} size={[11, 0.027, 0.72]} color="#e0ceaa" />
      <Box position={[0, 0.252, 3.15]} size={[11, 0.027, 0.72]} color="#e0ceaa" />
      {PLOTS.slice(0, props.island.projects.length).map((plot, i) => (
        <Box
          key={'lane' + i}
          position={[plot.x, 0.252, plot.y + 1.55]}
          size={[0.7, 0.025, 1.7]}
          color="#e0ceaa"
        />
      ))}
      {TREES.map((t, i) => (
        <Tree key={i} x={t.x} z={t.y} index={i} color={p.tree} motion={!props.reducedMotion} />
      ))}
      {props.island.projects.map((project, index) => (
        <House key={project.id} index={index} props={props} />
      ))}
      <Box position={[0, 0.15, 7.3]} size={[1.5, 0.18, 3.7]} color="#a5865d" />
      {Array.from({ length: 17 }, (_, i) => (
        <Box
          key={'plank' + i}
          position={[0, 0.26, 5.55 + i * 0.21]}
          size={[1.47, 0.035, 0.025]}
          color="#785f43"
        />
      ))}
      {[5.6, 7.2, 8.95].flatMap((z) =>
        [-0.82, 0.82].map((x) => (
          <Box key={`${x},${z}`} position={[x, 0.4, z]} size={[0.12, 0.7, 0.12]} color="#96774e" />
        )),
      )}
      <Box position={[-1.6, 0.7, 5.8]} size={[0.07, 1, 0.07]} color="#8d7454" />
      <Box position={[-1.6, 1.1, 5.8]} size={[1.3, 0.5, 0.09]} color="#e8d6aa" />
      <Html position={[-1.6, 1.15, 5.85]} center zIndexRange={[14, 0]}>
        <span className="welcome-sign">WELCOME</span>
      </Html>
      <Box position={[3.5, 0.27, 4.65]} size={[3.6, 0.07, 1.5]} color="#a88b60" />
      {props.island.contributions.length > 0 && <Garden days={props.island.contributions} />}
      <Html position={[3.5, 0.5, 5.6]} center zIndexRange={[14, 0]}>
        <span className="garden-label">CONTRIBUTION GARDEN</span>
      </Html>
      <Box position={[-3.4, 0.27, 4.5]} size={[1.6, 0.035, 1.1]} color="#dfbfa1" />
      <Box position={[-3.4, 0.3, 4.5]} size={[0.4, 0.06, 0.32]} color="#f5edcf" />
      {Array.from({ length: 30 }, (_, i) => {
        const x = ((seed('flowerx' + i) % 160) - 80) / 10,
          z = ((seed('flowerz' + i) % 100) - 50) / 10;
        if (
          Math.abs(x) < 1.5 ||
          PLOTS.some((p) => Math.abs(p.x - x) < 1.6 && Math.abs(p.y - z) < 1.8)
        )
          return null;
        return (
          <group key={'fl' + i} position={[x, 0.27, z]}>
            <Box position={[0, 0.12, 0]} size={[0.035, 0.24, 0.035]} color="#6b8852" />
            <mesh position={[0, 0.27, 0]}>
              <icosahedronGeometry args={[0.1, 0]} />
              <meshStandardMaterial color={i % 2 ? '#f2d28b' : '#eedfcf'} />
            </mesh>
          </group>
        );
      })}
      <Boat motion={!props.reducedMotion} />
      <Explorer props={props} />
    </>
  );
}
function GraphicsFallback({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return (
    <div className="scene-fallback">
      <p>3D graphics are unavailable.</p>
      <p>Choose Pixel island or explore the project list below.</p>
    </div>
  );
}
export default function ThreeIsland(props: SceneProps) {
  return (
    <div className="scene-render three-render" role="img" aria-label="Playable miniature 3D island">
      <Canvas
        shadows
        orthographic
        camera={{ position: [14, 18, 22], zoom: 28, near: 0.1, far: 150 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        fallback={<GraphicsFallback onReady={props.onReady} />}
      >
        <World {...props} />
      </Canvas>
    </div>
  );
}
