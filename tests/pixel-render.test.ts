import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCanvas } from '@napi-rs/canvas';
import { DEMO } from '../src/lib/demo';
import { BUILDING_IDS } from '../src/lib/buildings';
import { paintIsland, W, H } from '../src/lib/pixel-art';
import { roomDecor } from '../src/lib/room-decor';
test('actual pixel painter renders every building and day/night scenes without changing project data', () => {
  const original = JSON.stringify(DEMO),
    images = new Set<string>();
  for (const building of BUILDING_IDS)
    for (const lighting of ['day', 'night'] as const) {
      const canvas = createCanvas(W, H);
      const island = { ...DEMO, projects: DEMO.projects.map((p) => ({ ...p, building })) };
      paintIsland(
        canvas.getContext('2d') as unknown as CanvasRenderingContext2D,
        island,
        'lagoon',
        'explorer',
        { x: 0, y: 6.3, moving: false },
        0,
        lighting,
      );
      images.add(canvas.toBuffer('image/png').toString('base64'));
    }
  assert.equal(images.size, 12);
  assert.equal(JSON.stringify(DEMO), original);
});
test('room decorations stay on the wall panel instead of adding floor obstacles', () => {
  for (const kind of BUILDING_IDS)
    for (const tile of roomDecor(kind)) {
      assert.ok([tile.x, tile.y, tile.w, tile.h].every(Number.isFinite));
      assert.ok(tile.x >= 0 && tile.y >= 0 && tile.w > 0 && tile.h > 0);
      assert.ok(tile.x + tile.w <= 100 && tile.y + tile.h <= 68);
    }
});
