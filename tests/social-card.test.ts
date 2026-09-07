import test from 'node:test';
import assert from 'node:assert/strict';
import { socialCard } from '../src/lib/social-card';
import { DEMO } from '../src/lib/demo';

test('personalized social cards render real PNG bytes in day and night with a selected room', async () => {
  for (const lighting of ['day', 'night'] as const) {
    const response = socialCard('demo', 'lagoon', DEMO, lighting, DEMO.projects[0]);
    const png = Buffer.from(await response.arrayBuffer());
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
  }
});
