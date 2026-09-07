import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';

// Source: the app's Download island postcard button, Miniature 3D / Lagoon / Day.
// Compose the real WebGL render without generative image processing.
GlobalFonts.registerFromPath(
  'node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff',
  'Space Grotesk',
);
async function main() {
  const source = await loadImage('assets/social/island-postcard.png');
  const canvas = createCanvas(1200, 630);
  const c = canvas.getContext('2d');
  c.fillStyle = '#d9e3dc';
  c.fillRect(0, 0, 1200, 630);
  c.drawImage(source, 350, 250, 980, 620, 380, 75, 820, 519);
  c.fillStyle = '#234f43';
  c.font = 'bold 27px "Space Grotesk"';
  c.fillText('dev island.', 50, 70);
  c.font = 'bold 58px "Space Grotesk"';
  c.fillText('Your GitHub,', 50, 225);
  c.fillText('with room', 50, 291);
  c.fillText('to explore.', 50, 357);
  c.font = '20px "Space Grotesk"';
  c.fillStyle = '#536d60';
  c.fillText('A playable world of your projects.', 52, 412);
  c.font = '16px "Space Grotesk"';
  c.fillText('WALK IN. LOOK AROUND.', 52, 574);
  writeFileSync('public/social/dev-island-3d-v3.jpg', canvas.toBuffer('image/jpeg', 90));
}
void main();
