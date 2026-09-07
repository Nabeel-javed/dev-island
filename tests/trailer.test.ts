import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trailerFrame, recordingType } from '../src/lib/trailer';
test('trailer handles no projects and clamps time to a finite camera frame', () => {
  for (const t of [-100, 0, 5, 12, 99, NaN]) {
    const shot = trailerFrame(t, 0);
    assert.equal(shot.project, -1);
    assert.ok([...shot.target, ...shot.position, shot.zoom].every(Number.isFinite));
  }
});
test('camera transitions stay continuous at project boundaries and trailer ends wide', () => {
  for (const count of [1, 2, 3, 6]) {
    for (let t = 0; t <= 12; t += 0.01) {
      const a = trailerFrame(t, count),
        b = trailerFrame(t + 0.01, count);
      assert.ok(Math.hypot(...a.target.map((v, i) => v - b.target[i])) < 0.2);
      assert.ok(a.project < Math.min(count, 3));
    }
    assert.equal(trailerFrame(12, count).zoom, 1);
    assert.equal(trailerFrame(12, count).ending, true);
  }
});
test('recording chooses supported MP4 first, falls back to WebM, or declines export', () => {
  assert.equal(
    recordingType((t) => t === 'video/mp4' || t === 'video/webm'),
    'video/mp4',
  );
  assert.equal(
    recordingType((t) => t === 'video/webm'),
    'video/webm',
  );
  assert.equal(
    recordingType(() => false),
    null,
  );
});
