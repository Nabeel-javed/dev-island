'use client';
import RoomMaterial from './room-material';
function Timber({
  at,
  size,
  color = '#b39b77',
}: {
  at: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={at} castShadow receiveShadow>
      <boxGeometry args={size} />
      <RoomMaterial color={color} finish="wood" />
    </mesh>
  );
}
export default function RoomArchitecture({ night }: { night: boolean }) {
  return (
    <>
      {/* Low panelling and trim sit against the existing wall, outside walkable space. */}
      <Timber at={[0, 1.03, -4.66]} size={[12.45, 0.08, 0.1]} />
      <Timber at={[-6.16, 1.03, 0]} size={[0.1, 0.08, 9.5]} />
      {Array.from({ length: 9 }, (_, i) => (
        <Timber key={i} at={[-5.8 + i * 1.45, 0.73, -4.67]} size={[0.045, 0.53, 0.08]} />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <Timber key={i} at={[-6.17, 0.73, -4.25 + i * 1.4]} size={[0.08, 0.53, 0.045]} />
      ))}
      <Timber at={[4.6, 1.43, -4.42]} size={[1.9, 0.12, 0.43]} color="#e4d7b9" />
      <Timber at={[4.6, 2.87, -4.49]} size={[1.88, 0.09, 0.17]} color="#e4d7b9" />
      {[3.76, 5.44].map((x) => (
        <Timber key={x} at={[x, 2.15, -4.49]} size={[0.09, 1.43, 0.17]} color="#e4d7b9" />
      ))}
      {/* Staggered plank joints add scale without extra collision surfaces. */}
      {Array.from({ length: 12 }, (_, i) =>
        [-3, 0, 3].map((z, j) => (
          <mesh key={`${i}:${j}`} position={[-5.5 + i, 0.27, z + (i % 2) * 1.25]}>
            <boxGeometry args={[0.975, 0.003, 0.016]} />
            <meshStandardMaterial color="#b09a77" roughness={1} />
          </mesh>
        )),
      )}
      {[-4.85, 2.7].map((x) => (
        <group key={x} position={[x, 2.6, -4.47]}>
          <Timber at={[0, 0, -0.12]} size={[0.18, 0.32, 0.12]} color="#806b4d" />
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.26, 8]} />
            <meshStandardMaterial color="#a58b59" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.1, 0.12]} castShadow>
            <cylinderGeometry args={[0.12, 0.19, 0.25, 20]} />
            <meshStandardMaterial
              color="#f1dfb7"
              emissive="#ffd799"
              emissiveIntensity={night ? 0.65 : 0.08}
              roughness={0.9}
            />
          </mesh>
          <pointLight
            position={[0, 0, 0.28]}
            intensity={night ? 2.8 : 0.35}
            color="#ffd69b"
            distance={4}
            decay={2}
          />
        </group>
      ))}
    </>
  );
}
