import { PLOTS, seed } from './island';
export function grassPositions(count: number) {
  const positions: { x: number; z: number; height: number; rotation: number }[] = [];
  for (let i = 0; positions.length < count && i < count * 16; i++) {
    const x = (seed('meadow-x' + i) % 1800) / 100 - 9;
    const z = (seed('meadow-z' + i) % 1280) / 100 - 6.4;
    if (
      (x * x) / 79 + (z * z) / 39 > 1 ||
      Math.abs(x) < 0.75 ||
      (Math.abs(z + 1.5) < 0.55 && Math.abs(x) < 5.8) ||
      (Math.abs(z - 3.15) < 0.55 && Math.abs(x) < 5.8)
    )
      continue;
    if (PLOTS.some((p) => Math.abs(x - p.x) < 1.65 && z > p.y - 1.35 && z < p.y + 2.5)) continue;
    if (z > 3.7 && ((x > 1.5 && x < 5.5) || (x > -4.6 && x < -2.2))) continue;
    positions.push({
      x,
      z,
      height: 0.55 + (seed('height' + i) % 80) / 100,
      rotation: (seed('angle' + i) % 628) / 100,
    });
  }
  return positions;
}
