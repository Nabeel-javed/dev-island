import { Vector3 } from 'three';
export const ROOM_FRAME_POINTS = [
  [-6.5, -0.3, -5],
  [6.5, -0.3, -5],
  [-6.5, -0.3, 5],
  [6.5, -0.3, 5],
  [-6.5, 3.8, -5],
  [6.5, 3.8, -5],
  [-6.5, 3.8, 5],
] as const;
export const ROOM_FOV = 34;
export function roomCameraFrame(width: number, height: number, zoom = 1, angle = 0) {
  const aspect = Math.max(1, width) / Math.max(1, height);
  const direction = new Vector3(11, 10, 16).normalize().applyAxisAngle(new Vector3(0, 1, 0), angle);
  const right = new Vector3().crossVectors(new Vector3(0, 1, 0), direction).normalize();
  const up = new Vector3().crossVectors(direction, right).normalize();
  const target = new Vector3(0, 1.2, 0);
  const tanY = Math.tan((ROOM_FOV * Math.PI) / 360),
    tanX = tanY * aspect;
  let distance = 0;
  for (const point of ROOM_FRAME_POINTS) {
    const relative = new Vector3(...point).sub(target);
    const depth = relative.dot(direction);
    distance = Math.max(
      distance,
      depth + Math.abs(relative.dot(right)) / tanX,
      depth + Math.abs(relative.dot(up)) / tanY,
    );
  }
  const position = target.clone().addScaledVector(direction, (distance * 1.1) / zoom);
  return {
    position: position.toArray() as [number, number, number],
    target: target.toArray() as [number, number, number],
  };
}
