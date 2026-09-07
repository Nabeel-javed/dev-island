import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OrthographicCamera, Vector3 } from 'three';
import { TREES } from '../src/lib/island';
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
});
test('closer island framing keeps the shore, trees and jetty visible at the starting angle', () => {
  const landmarks = [
    ...Array.from({ length: 48 }, (_, i) => [
      Math.cos((i * Math.PI) / 24) * 10.45,
      -0.44,
      Math.sin((i * Math.PI) / 24) * 7.53,
    ]),
    ...TREES.map((t) => [t.x, 3, t.y]),
    [-0.9, 0.4, 9.2],
    [0.9, 0.4, 9.2],
  ];
  for (const [w, h] of [
    [320, 568],
    [844, 390],
    [1920, 1080],
    [760, 506],
  ]) {
    const camera = new OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 150);
    camera.position.set(14, 18, 22);
    camera.lookAt(0, 0, 1);
    camera.zoom = fitIslandZoom(w, h);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    for (const p of landmarks) {
      const q = new Vector3(...p).project(camera);
      assert.ok(Math.abs(q.x) < 1 && Math.abs(q.y) < 1, `${w}x${h}: landmark cropped`);
    }
  }
});
