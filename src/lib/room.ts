export type StationId = 'overview' | 'readme' | 'technology' | 'demo';
export const STATIONS = [
  {
    id: 'overview',
    title: 'Overview board',
    short: 'Overview',
    x: -3.8,
    y: -2.5,
    width: 2.4,
    depth: 1.0,
    caption: 'The idea behind the code',
  },
  {
    id: 'readme',
    title: 'README bookshelf',
    short: 'README',
    x: 0,
    y: -3.1,
    width: 2.1,
    depth: 1.0,
    caption: 'Read the whole story',
  },
  {
    id: 'technology',
    title: 'Technology desk',
    short: 'Technology',
    x: 3.7,
    y: -2.2,
    width: 2.3,
    depth: 1.4,
    caption: 'What it’s made of',
  },
  {
    id: 'demo',
    title: 'Demo display',
    short: 'Demo & images',
    x: 4,
    y: 1.6,
    width: 2.0,
    depth: 1.5,
    caption: 'See it in the world',
  },
] as const;
export const ROOM_EXIT = { x: 0, y: 4.2 };
export const ROOM_SPAWN = { x: 0, y: 2.9 };
export function canWalkRoom(x: number, y: number) {
  return (
    Math.abs(x) < 5.9 &&
    y > -4.2 &&
    y < 4.55 &&
    !STATIONS.some(
      (s) => Math.abs(x - s.x) < s.width / 2 + 0.24 && Math.abs(y - s.y) < s.depth / 2 + 0.24,
    ) &&
    !(x < -4.6 && y > 2.5)
  );
}
export function advanceRoom(p: { x: number; y: number }, dx: number, dy: number, dt: number) {
  const distance = (Math.min(Math.max(dt, 0), 0.05) * 3.6) / (Math.hypot(dx, dy) || 1);
  const x = p.x + dx * distance,
    y = p.y + dy * distance;
  const nextX = canWalkRoom(x, p.y) ? x : p.x;
  return { x: nextX, y: canWalkRoom(nextX, y) ? y : p.y };
}
export function nearestRoomTarget(p: { x: number; y: number }) {
  const targets = [...STATIONS.map((s) => ({ x: s.x, y: s.y + s.depth / 2 + 0.65 })), ROOM_EXIT];
  let nearest = -1,
    distance = 1.65;
  targets.forEach((t, i) => {
    const d = Math.hypot(t.x - p.x, t.y - p.y);
    if (d < distance) {
      nearest = i;
      distance = d;
    }
  });
  return nearest;
}
