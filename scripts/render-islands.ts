import { paintPixelRoom } from '../src/lib/pixel-room-art';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { DEMO } from '../src/lib/demo';
import { BUILDING_IDS } from '../src/lib/buildings';
import { roomDecor } from '../src/lib/room-decor';
import { paintIsland, W, H } from '../src/lib/pixel-art';
mkdirSync('artifacts', { recursive: true });
const island = {
  ...DEMO,
  projects: DEMO.projects.map((p, i) => ({ ...p, building: BUILDING_IDS[i] })),
};
for (const lighting of ['day', 'night'] as const) {
  const canvas = createCanvas(W, H);
  paintIsland(
    canvas.getContext('2d') as unknown as CanvasRenderingContext2D,
    island,
    'lagoon',
    'explorer',
    { x: 0, y: 6.3, moving: false },
    0,
    lighting,
  );
  writeFileSync(`artifacts/pixel-buildings-${lighting}.png`, canvas.toBuffer('image/png'));
}
const sheet = createCanvas(600, 210),
  c = sheet.getContext('2d');
c.fillStyle = '#f8f7f1';
c.fillRect(0, 0, 600, 210);
BUILDING_IDS.forEach((kind, i) => {
  const x = 15 + (i % 3) * 200,
    y = 8 + Math.floor(i / 3) * 105;
  for (const tile of roomDecor(kind)) {
    c.fillStyle = tile.color;
    c.fillRect(x + tile.x, y + tile.y, tile.w, tile.h);
  }
  c.fillStyle = '#294e49';
  c.font = '13px sans-serif';
  c.fillText(kind, x, y + 86);
});
writeFileSync('artifacts/room-decorations.png', sheet.toBuffer('image/png'));
console.log('Rendered day/night pixel islands and room decoration sheet in artifacts/.');

for (const lighting of ['day', 'night'] as const) {
  const canvas = createCanvas(640, 480);
  paintPixelRoom(
    canvas.getContext('2d') as unknown as CanvasRenderingContext2D,
    {
      identity: 'demo/moss-ui',
      building: 'cottage',
      avatar: 'explorer',
      palette: 'lagoon',
      lighting,
      reducedMotion: false,
      player: { x: 0, y: 2.9, moving: false },
    },
    1200,
  );
  writeFileSync(`artifacts/pixel-room-${lighting}.png`, canvas.toBuffer('image/png'));
}
