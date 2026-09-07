export type GraphicsChoice = 'auto' | 'high' | 'low';
export type GraphicsLevel = 'low' | 'balanced' | 'high';
export const GRAPHICS = {
  low: { dpr: 1, shadowSize: 512, blades: 180, waterSegments: 64 },
  balanced: { dpr: 1.35, shadowSize: 1024, blades: 420, waterSegments: 112 },
  high: { dpr: 1.75, shadowSize: 2048, blades: 760, waterSegments: 160 },
} as const;
export function readGraphics(value: unknown): GraphicsChoice {
  return value === 'high' || value === 'low' ? value : 'auto';
}
export function changeGraphicsLevel(level: GraphicsLevel, direction: -1 | 1): GraphicsLevel {
  const levels: GraphicsLevel[] = ['low', 'balanced', 'high'];
  return levels[Math.max(0, Math.min(2, levels.indexOf(level) + direction))];
}
