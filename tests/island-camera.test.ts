import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cameraMovement, fitIslandZoom } from '../src/lib/island-camera';
test('camera-relative movement preserves direction length across all viewing angles', () => {
  for (const yaw of [0, Math.PI / 2, Math.PI, -1.7]) {
    for (const [x, y] of [
      [1, 0],
      [0, -1],
      [1, 1],
      [0, 0],
    ]) {
      const d = cameraMovement(x, y, yaw);
      assert.ok(Math.abs(Math.hypot(d.dx, d.dy) - Math.hypot(x, y)) < 1e-12);
    }
  }
  assert.deepEqual(cameraMovement(1, 0), { dx: 1, dy: 0 });
  const up = cameraMovement(0, -1, Math.PI / 2);
  assert.ok(Math.abs(up.dx + 1) < 1e-12 && Math.abs(up.dy) < 1e-12);
  for (const [w, h] of [
    [320, 568],
    [844, 390],
    [1920, 1080],
  ]) {
    const zoom = fitIslandZoom(w, h);
    assert.ok(25.5 * zoom <= w && 22 * zoom <= h);
  }
});
