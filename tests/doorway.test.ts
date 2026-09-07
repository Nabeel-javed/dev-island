import { test } from 'node:test';
import assert from 'node:assert/strict';
import { doorwayPath, clearWalkSegment, pathLength, pointOnPath } from '../src/lib/doorway';
import { PLOTS } from '../src/lib/island';
test('every doorway is reachable from spawn and every other doorway without crossing buildings', () => {
  for (const start of [{ x: 0, y: 6.1 }, ...PLOTS.map((p) => ({ x: p.x, y: p.y + 1.35 }))])
    for (let i = 0; i < 6; i++) {
      const path = doorwayPath(start, i, 6);
      assert.ok(path);
      assert.deepEqual(path[0], start);
      assert.deepEqual(path.at(-1), { x: PLOTS[i].x, y: PLOTS[i].y + 1.35 });
      for (let j = 1; j < path.length; j++) assert.ok(clearWalkSegment(path[j - 1], path[j], 6));
      assert.deepEqual(pointOnPath(path, pathLength(path) + 10), path.at(-1));
    }
});
test('empty/invalid destinations cannot start an entrance', () => {
  assert.equal(doorwayPath({ x: 0, y: 6.1 }, 0, 0), null);
  assert.equal(doorwayPath({ x: NaN, y: 0 }, 0, 6), null);
  assert.equal(doorwayPath({ x: 0, y: 6.1 }, 6, 6), null);
});
