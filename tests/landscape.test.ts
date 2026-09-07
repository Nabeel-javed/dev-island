import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grassPositions } from '../src/lib/landscape';
import { PLOTS } from '../src/lib/island';
test('landscaping is deterministic and leaves paths, entrances and exhibit spaces clear', () => {
  const positions = grassPositions(760);
  assert.equal(positions.length, 760);
  assert.deepEqual(positions, grassPositions(760));
  assert.deepEqual(grassPositions(180), positions.slice(0, 180));
  for (const p of positions) {
    assert.ok((p.x * p.x) / 79 + (p.z * p.z) / 39 <= 1);
    assert.ok(Math.abs(p.x) >= 0.75);
    assert.ok(
      !PLOTS.some(
        (plot) => Math.abs(p.x - plot.x) < 1.65 && p.z > plot.y - 1.35 && p.z < plot.y + 2.5,
      ),
    );
    assert.ok([p.x, p.z, p.height, p.rotation].every(Number.isFinite));
  }
});
