import { canWalk, PLOTS } from './island';
export type WalkPoint = { x: number; y: number };
export type DoorwayFrame = { index: number; focus: number; door: number };
const GRID = 0.4;
export function clearWalkSegment(a: WalkPoint, b: WalkPoint, count: number) {
  const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.08));
  for (let i = 0; i <= steps; i++)
    if (!canWalk(a.x + ((b.x - a.x) * i) / steps, a.y + ((b.y - a.y) * i) / steps, count))
      return false;
  return true;
}
export function doorwayPath(start: WalkPoint, index: number, count: number): WalkPoint[] | null {
  const plot = PLOTS[index];
  if (!plot || index >= count || !Number.isFinite(start.x) || !Number.isFinite(start.y))
    return null;
  const goal = { x: plot.x, y: plot.y + 1.35 };
  if (clearWalkSegment(start, goal, count)) return [{ ...start }, goal];
  const nodes = new Map<string, WalkPoint>();
  for (let x = -23; x <= 23; x++)
    for (let y = -17; y <= 22; y++)
      if (canWalk(x * GRID, y * GRID, count)) nodes.set(`${x},${y}`, { x: x * GRID, y: y * GRID });
  const closest = (point: WalkPoint) =>
    [...nodes]
      .filter(
        ([, p]) =>
          Math.hypot(p.x - point.x, p.y - point.y) < 0.8 && clearWalkSegment(point, p, count),
      )
      .sort(
        (a, b) =>
          Math.hypot(a[1].x - point.x, a[1].y - point.y) -
          Math.hypot(b[1].x - point.x, b[1].y - point.y),
      )[0]?.[0];
  const from = closest(start),
    to = closest(goal);
  if (!from || !to) return null;
  const queue = [from],
    previous = new Map<string, string | null>([[from, null]]);
  for (let n = 0; n < queue.length; n++) {
    const key = queue[n];
    if (key === to) break;
    const [x, y] = key.split(',').map(Number);
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const next = `${x + dx},${y + dy}`;
      if (
        nodes.has(next) &&
        !previous.has(next) &&
        clearWalkSegment(nodes.get(key)!, nodes.get(next)!, count)
      ) {
        previous.set(next, key);
        queue.push(next);
      }
    }
  }
  if (!previous.has(to)) return null;
  const path: WalkPoint[] = [goal];
  for (let key: string | null = to; key; key = previous.get(key) ?? null)
    path.unshift(nodes.get(key)!);
  path.unshift({ ...start });
  // Remove unnecessary corners without ever cutting through a building.
  const smooth = [path[0]];
  for (let i = 0; i < path.length - 1;) {
    let j = path.length - 1;
    while (j > i + 1 && !clearWalkSegment(path[i], path[j], count)) j--;
    smooth.push(path[j]);
    i = j;
  }
  return smooth;
}
export function pathLength(path: WalkPoint[]) {
  return path.slice(1).reduce((n, p, i) => n + Math.hypot(p.x - path[i].x, p.y - path[i].y), 0);
}
export function pointOnPath(path: WalkPoint[], distance: number): WalkPoint {
  let remaining = Math.max(0, distance);
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1],
      b = path[i],
      length = Math.hypot(b.x - a.x, b.y - a.y);
    if (remaining <= length && length > 0)
      return {
        x: a.x + ((b.x - a.x) * remaining) / length,
        y: a.y + ((b.y - a.y) * remaining) / length,
      };
    remaining -= length;
  }
  return path[path.length - 1] ?? { x: 0, y: 6.1 };
}
