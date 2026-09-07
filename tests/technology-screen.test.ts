import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCanvas } from '@napi-rs/canvas';
import { paintTechnologyScreen } from '../src/lib/technology-screen';
test('technology exhibit visibly differentiates loading, unavailable, sample and repository data', () => {
  const canvas = createCanvas(512, 320),
    ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  const images = new Set<string>();
  const available = {
    name: 'example',
    languageStatus: 'available' as const,
    languages: [
      { name: 'TypeScript', bytes: 80 },
      { name: 'CSS', bytes: 20 },
    ],
    source: 'github' as const,
  };
  for (const data of [
    undefined,
    { ...available, languageStatus: 'unavailable' as const },
    available,
    { ...available, source: 'demo' as const },
  ]) {
    paintTechnologyScreen(ctx, data);
    images.add(canvas.toBuffer('image/png').toString('base64'));
  }
  assert.equal(images.size, 4);
  assert.equal(available.languages[0].bytes, 80);
});
