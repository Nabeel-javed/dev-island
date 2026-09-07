import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3 } from 'three';
import { roomCameraFrame, ROOM_FRAME_POINTS, ROOM_FOV } from '../src/lib/room-camera';
test('room framing keeps floor and walls visible across phone, landscape and desktop sizes', () => {
  for (const [width, height] of [
    [320, 480],
    [390, 540],
    [844, 290],
    [1440, 650],
    [700, 650],
  ]) {
    for (const angle of [-0.2, 0, 0.2]) {
      const frame = roomCameraFrame(width, height, 1, angle);
      const camera = new PerspectiveCamera(ROOM_FOV, width / height, 0.1, 250);
      camera.position.set(...frame.position);
      camera.lookAt(...frame.target);
      camera.updateMatrixWorld();
      for (const point of ROOM_FRAME_POINTS) {
        const p = new Vector3(...point).project(camera);
        assert.ok(
          Math.abs(p.x) < 1 && Math.abs(p.y) < 1 && p.z < 1,
          `${width}x${height}: room cropped`,
        );
      }
    }
  }
});
