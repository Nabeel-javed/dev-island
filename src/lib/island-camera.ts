export const fitIslandZoom = (width: number, height: number) =>
  Math.max(1, Math.min(width / 25.5, height / 22));
export function cameraMovement(dx: number, dy: number, yaw = 0) {
  return {
    dx: dx * Math.cos(yaw) + dy * Math.sin(yaw),
    dy: -dx * Math.sin(yaw) + dy * Math.cos(yaw),
  };
}
