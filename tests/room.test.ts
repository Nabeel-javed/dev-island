import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceRoom,
  canWalkRoom,
  nearestRoomTarget,
  ROOM_EXIT,
  ROOM_SPAWN,
  STATIONS,
} from '../src/lib/room';
test('room spawn, walls and furniture use shared walkable bounds', () => {
  assert.ok(canWalkRoom(ROOM_SPAWN.x, ROOM_SPAWN.y));
  for (const s of STATIONS) {
    assert.ok(!canWalkRoom(s.x, s.y));
    assert.ok(canWalkRoom(s.x, s.y + s.depth / 2 + 0.65));
  }
  assert.ok(!canWalkRoom(6, 0));
  assert.ok(!canWalkRoom(0, -4.3));
});
test('every station and exit can be reached from the spawn without crossing furniture', () => {
  for (const target of [
    ...STATIONS.map((s) => ({ x: s.x, y: s.y + s.depth / 2 + 0.65 })),
    ROOM_EXIT,
  ]) {
    // Traverse the open central aisle, then move toward the station.
    let p = { ...ROOM_SPAWN };
    const aisle = target.y < 2 ? 0 : ROOM_SPAWN.y;
    for (const point of [{ x: 0, y: aisle }, { x: target.x, y: aisle }, target]) {
      for (let i = 0; i < 1000 && Math.hypot(point.x - p.x, point.y - p.y) > 0.1; i++)
        p = advanceRoom(p, point.x - p.x, point.y - p.y, 0.02);
      assert.ok(Math.hypot(point.x - p.x, point.y - p.y) < 0.11);
    }
    assert.notEqual(nearestRoomTarget(p), -1);
  }
});
test('room interactions select the closest station and movement is normalized', () => {
  STATIONS.forEach((s, i) =>
    assert.equal(nearestRoomTarget({ x: s.x, y: s.y + s.depth / 2 + 0.65 }), i),
  );
  assert.equal(nearestRoomTarget(ROOM_EXIT), 4);
  assert.equal(nearestRoomTarget({ x: -3, y: 2 }), -1);
  const p = advanceRoom({ x: 0, y: 0 }, 1, 1, 0.02);
  assert.ok(Math.abs(Math.hypot(p.x, p.y) - 0.072) < 1e-9);
});
