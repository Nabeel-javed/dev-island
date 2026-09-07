import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEMO } from '../src/lib/demo';
import { passportComplete, restoreStamps, stampProject } from '../src/lib/passport';
test('passport tracks repository identities rather than changing building positions', () => {
  const stamps = stampProject([], DEMO.projects[2]);
  const restored = restoreStamps(
    JSON.stringify({ version: 1, stamps }),
    [...DEMO.projects].reverse(),
  );
  assert.deepEqual(restored, ['demo/canvas-notes']);
  assert.deepEqual(stampProject(restored, DEMO.projects[2]), restored);
});
test('passport discards corrupt, foreign and no-longer-featured stamps', () => {
  for (const raw of [null, 'not json', '{"version":2,"stamps":[]}', '{"version":1,"stamps":{}}'])
    assert.deepEqual(restoreStamps(raw, DEMO.projects), []);
  assert.deepEqual(
    restoreStamps(
      JSON.stringify({
        version: 1,
        stamps: ['DEMO/MOSS-UI', 'demo/moss-ui', 'other/repo', 7, null],
      }),
      DEMO.projects,
    ),
    ['demo/moss-ui'],
  );
  assert.deepEqual(restoreStamps(JSON.stringify({ version: 1, stamps: ['demo/moss-ui'] }), []), []);
});
test('an empty island cannot award a completion souvenir', () => {
  assert.equal(passportComplete(0, 0), false);
  assert.equal(passportComplete(5, 6), false);
  assert.equal(passportComplete(6, 6), true);
});

test('custom layouts preserve stamps for hidden rooms without accepting malformed identities', () => {
  const saved = JSON.stringify({
    version: 1,
    stamps: ['demo/moss-ui', 'demo/dotfiles', '../../invalid'],
  });
  const restored = restoreStamps(saved, [], true);
  assert.deepEqual(restored, ['demo/moss-ui', 'demo/dotfiles']);
});
