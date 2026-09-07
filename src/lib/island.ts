import type { BuildingId, LightingId } from './buildings';
export type PaletteId = 'lagoon' | 'sunset' | 'lavender';
export type StyleId = 'pixel' | '3d';
export type AvatarId = 'explorer' | 'gardener' | 'sailor' | 'astronaut';
export type Project = {
  building?: BuildingId;
  owner: string;
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  url: string;
  homepage?: string;
  updatedAt: string;
  fork?: boolean;
  archived?: boolean;
  private?: boolean;
};
export type Day = { date: string; count: number };
export type Island = {
  login: string;
  name: string;
  bio: string;
  location: string;
  projects: Project[];
  contributions: Day[];
  totalContributions: number | null;
  followers: number;
  source: 'demo' | 'github';
  updatedAt: string;
  notice?: string;
  customView?: boolean;
  customIntro?: string;
  defaultProjects?: Project[];
};
export const PALETTES = {
  lagoon: {
    name: 'Lagoon',
    water: '#b6d8d4',
    deep: '#92c4c2',
    grass: '#8cac70',
    light: '#afc68a',
    tree: '#497c5b',
    roof: '#bb7253',
    accent: '#205c50',
  },
  sunset: {
    name: 'Golden hour',
    water: '#dbc5b2',
    deep: '#c5aba2',
    grass: '#a6ad70',
    light: '#c5c98b',
    tree: '#74875b',
    roof: '#b76354',
    accent: '#92523f',
  },
  lavender: {
    name: 'Lavender',
    water: '#c3c6dd',
    deep: '#a4aacd',
    grass: '#9eaf92',
    light: '#bbccae',
    tree: '#647d77',
    roof: '#887498',
    accent: '#66537b',
  },
} as const;
export const AVATARS: { id: AvatarId; name: string; color: string; skin: string }[] = [
  { id: 'explorer', name: 'Explorer', color: '#d4964d', skin: '#d9a579' },
  { id: 'gardener', name: 'Gardener', color: '#638d61', skin: '#9c684b' },
  { id: 'sailor', name: 'Sailor', color: '#548bb0', skin: '#edc2a0' },
  { id: 'astronaut', name: 'Astronaut', color: '#d4cfba', skin: '#986246' },
];
export const PLOTS = [
  { x: -5, y: -3 },
  { x: 0, y: -3.7 },
  { x: 5, y: -3 },
  { x: -5, y: 1 },
  { x: 0, y: 1.2 },
  { x: 5, y: 1 },
];
export const TREES = [
  { x: -7.2, y: -2.8 },
  { x: -6.8, y: -4.3 },
  { x: -4, y: -5.3 },
  { x: -2, y: -5.6 },
  { x: 2.5, y: -5.3 },
  { x: 6.4, y: -4.5 },
  { x: 7.2, y: -2 },
  { x: 7.6, y: 0.5 },
  { x: -7.3, y: 0.2 },
  { x: -7, y: 2.6 },
  { x: -5.8, y: 4 },
  { x: -4.4, y: 4.9 },
  { x: 6.6, y: 3.2 },
  { x: 5.7, y: 4.5 },
];
export function seed(text: string) {
  let n = 2166136261;
  for (const c of text) {
    n = Math.imul(n ^ c.charCodeAt(0), 16777619);
  }
  return n >>> 0;
}
export function validUsername(name: string) {
  return /^(?!-)(?!.*--)[a-zA-Z0-9-]{1,39}(?<!-)$/.test(name);
}
export function safeHomepage(value?: string | null) {
  try {
    if (!value) return undefined;
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password ? u.href : undefined;
  } catch {
    return undefined;
  }
}
export function selectProjects(pinned: Project[], owned: Project[]) {
  const result: Project[] = [];
  const ids = new Set<string>();
  const add = (p: Project) => {
    if (!p.private && !ids.has(p.id) && result.length < 6) {
      result.push(p);
      ids.add(p.id);
    }
  };
  pinned.forEach(add);
  owned
    .filter((p) => !p.fork && !p.archived && !p.private)
    .sort(
      (a, b) =>
        b.stars - a.stars || b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id),
    )
    .forEach(add);
  return result;
}
export function readAppearance(params: URLSearchParams) {
  return {
    lighting: (params.get('lighting') === 'night' ? 'night' : 'day') as LightingId,
    style: params.get('style') === '3d' ? ('3d' as const) : ('pixel' as const),
    palette: (params.get('palette') && Object.hasOwn(PALETTES, params.get('palette')!)
      ? params.get('palette')
      : 'lagoon') as PaletteId,
    avatar: (AVATARS.some((a) => a.id === params.get('avatar'))
      ? params.get('avatar')
      : 'explorer') as AvatarId,
  };
}
export function canWalk(x: number, y: number, count = 6) {
  const land =
    (x * x) / 81 + (y * y) / 42.25 < 0.94 || (Math.abs(x) < 0.72 && y >= 5.5 && y <= 8.5);
  return (
    land &&
    !PLOTS.slice(0, count).some((p) => Math.abs(x - p.x) < 1.1 && y > p.y - 0.85 && y < p.y + 0.85)
  );
}
export function advance(
  position: { x: number; y: number },
  dx: number,
  dy: number,
  dt: number,
  count = 6,
) {
  const length = Math.hypot(dx, dy) || 1;
  const d = Math.min(dt, 0.05) * 3.6;
  const x = position.x + (dx / length) * d,
    y = position.y + (dy / length) * d;
  return {
    x: canWalk(x, position.y, count) ? x : position.x,
    y: canWalk(canWalk(x, position.y, count) ? x : position.x, y, count) ? y : position.y,
  };
}
export const compact = (n: number) =>
  Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export function appearanceFromRecord(record: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const key of ['style', 'palette', 'avatar', 'lighting']) {
    const value = record[key];
    if (typeof value === 'string') params.set(key, value);
  }
  return readAppearance(params);
}
