import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GRAPHICS, readGraphics, changeGraphicsLevel } from '../src/lib/graphics';
test('graphics preferences reject unknown storage values and adaptation stays bounded', () => {
  for (const input of [null, {}, 'toString', 'ultra', '', 'auto'])
    assert.equal(readGraphics(input), 'auto');
  assert.equal(readGraphics('low'), 'low');
  assert.equal(readGraphics('high'), 'high');
  assert.equal(changeGraphicsLevel('high', 1), 'high');
  assert.equal(changeGraphicsLevel('low', -1), 'low');
  assert.equal(changeGraphicsLevel('balanced', -1), 'low');
  assert.equal(changeGraphicsLevel('balanced', 1), 'high');
  assert.ok(GRAPHICS.low.blades < GRAPHICS.high.blades);
  assert.ok(GRAPHICS.high.dpr <= 2);
});
