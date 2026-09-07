'use client';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { BackSide } from 'three';
import { useGraphics } from './graphics-settings';
import { changeGraphicsLevel } from '@/lib/graphics';
/** Generated locally and captured once; there is no HDR fetch or per-frame cube capture. */
export default function SceneLighting({
  night,
  interior = false,
}: {
  night: boolean;
  interior?: boolean;
}) {
  return (
    <Environment
      key={`${night}:${interior}`}
      frames={1}
      resolution={128}
      environmentIntensity={night ? 0.3 : interior ? 0.45 : 0.55}
    >
      <mesh scale={60}>
        <sphereGeometry args={[1, 24, 12]} />
        <meshBasicMaterial color={night ? '#233852' : '#b9d9e8'} side={BackSide} />
      </mesh>
      <Lightformer
        position={[-10, 18, 10]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[18, 18, 1]}
        intensity={night ? 0.5 : 2}
        color={night ? '#bdcef1' : '#fff0d4'}
      />
      <Lightformer
        position={[0, -10, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[40, 40, 1]}
        intensity={0.35}
        color={interior ? '#c1a583' : '#a4b68c'}
      />
    </Environment>
  );
}
export function GraphicsPerformance() {
  const { choice, setAutoLevel } = useGraphics();
  return choice === 'auto' ? (
    <PerformanceMonitor
      ms={750}
      iterations={8}
      flipflops={3}
      bounds={() => [35, 55]}
      onDecline={() => setAutoLevel((v) => changeGraphicsLevel(v, -1))}
      onIncline={() => setAutoLevel((v) => changeGraphicsLevel(v, 1))}
      onFallback={() => setAutoLevel('low')}
    />
  ) : null;
}
