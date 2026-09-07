import { BUILDINGS, scenePalette } from './buildings';
import { roomDecor } from './room-decor';
import { AVATARS, seed } from './island';
import { ROOM_EXIT, STATIONS } from './room';
import type { RoomSceneProps } from '../components/room-scene-types';
export const roomPoint = (x: number, y: number) => ({ x: 320 + x * 40, y: 247 + y * 26 });
const point = roomPoint;
export type PixelRoomArt = Omit<RoomSceneProps, 'controller' | 'onInteract'> & {
  player: { x: number; y: number; moving: boolean };
};
export function paintPixelRoom(c: CanvasRenderingContext2D, p: PixelRoomArt, time: number) {
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    c.fillStyle = color;
    c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  const text = (value: string, x: number, y: number, size = 10, color = '#435448') => {
    c.fillStyle = color;
    c.font = `${size}px monospace`;
    c.textAlign = 'center';
    c.fillText(value, x, y);
  };
  const theme = BUILDINGS[p.building],
    colors = { ...scenePalette(p.palette, p.lighting), accent: theme.accent, roof: theme.roof },
    a = AVATARS.find((a) => a.id === p.avatar)!;
  const player = p.player;
  const animation = p.reducedMotion ? 0 : time;
  c!.imageSmoothingEnabled = false;
  c!.clearRect(0, 0, 640, 480);
  rect(58, 138, 528, 258, '#233f3520');
  rect(64, 125, 512, 260, '#856d53');
  rect(64, 125, 512, 248, theme.floor);
  for (let row = 0; row < 14; row++) {
    const y = 128 + row * 18;
    rect(66, y, 508, 1, '#bfa77f');
    for (let x = 68 + (row % 2) * 42; x < 574; x += 85) rect(x, y, 1, 18, '#bfa77f');
  }
  // Contact shadows and stepped side walls establish the room as a cutaway.
  rect(69, 128, 502, 9, '#55483120');
  rect(69, 137, 8, 231, '#55483115');
  rect(64, 55, 512, 73, theme.wall);
  rect(64, 119, 512, 9, '#a48a65');
  rect(64, 53, 512, 5, colors.accent);
  for (let x = 78; x < 575; x += 22) rect(x, 59, 1, 57, '#ddd5bf');
  rect(62, 55, 7, 320, '#a48a65');
  rect(572, 55, 7, 320, '#a48a65');
  rect(57, 63, 7, 306, '#8d785a');
  rect(579, 63, 7, 306, '#78654d');
  rect(57, 55, 12, 5, '#e0cc9f');
  rect(572, 55, 14, 5, '#e0cc9f');
  for (let x = 82; x < 560; x += 48) {
    rect(x, 100, 35, 17, '#ae987735');
    rect(x + 2, 102, 31, 13, theme.wall);
  }
  // Window light falls in short pixel steps across the floor.
  if (p.lighting !== 'night')
    for (let row = 0; row < 12; row++) {
      rect(479 - row * 4, 133 + row * 5, 47 + row * 2, 5, '#fff5c321');
      rect(498 - row * 3, 133 + row * 5, 3, 5, '#77674713');
    }
  rect(244, 228, 155, 95, colors.accent);
  rect(250, 234, 143, 83, colors.light);
  rect(257, 241, 129, 69, colors.grass);
  for (let i = 0; i < 9; i++) {
    rect(258 + i * 15, 227, 2, 5, '#eee3c8');
    rect(258 + i * 15, 321, 2, 5, '#eee3c8');
  }
  // The room's window and wall art vary deterministically by repository.
  rect(470, 69, 64, 40, '#a88c64');
  rect(474, 73, 56, 32, colors.water);
  rect(478, 95, 48, 10, colors.light);
  rect(500, 72, 3, 35, '#f8edce');
  rect(472, 88, 61, 3, '#f8edce');
  rect(248, 71, 31, 34, '#a88c64');
  rect(252, 75, 23, 26, '#f7edda');
  rect(258, 81, 11, 14, ['#be866b', '#83996d', '#9c91aa'][seed(p.identity) % 3]);
  for (const tile of roomDecor(p.building))
    rect(364 + tile.x * 0.78, 61 + tile.y * 0.78, tile.w * 0.78, tile.h * 0.78, tile.color);
  // Draped curtains, a window ledge and a clock with a quiet pendulum.
  rect(466, 66, 72, 3, '#806949');
  for (const x of [467, 524]) {
    rect(x, 70, 9, 38, colors.accent);
    rect(x + 2, 70, 2, 36, '#ffffff30');
    rect(x, 91, 9, 3, '#d6bb82');
  }
  rect(468, 108, 68, 4, '#baa27a');
  rect(91, 70, 26, 36, '#876e51');
  rect(94, 73, 20, 19, '#f2e5c5');
  rect(103, 77, 2, 7, '#655c49');
  rect(103, 83, 6, 2, '#655c49');
  const pendulum = Math.round(Math.sin(animation / 600) * 3);
  rect(103 + pendulum, 94, 2, 6, '#d7bc82');
  rect(101 + pendulum, 100, 6, 3, '#d7bc82');
  // A low side cabinet with ceramics fills the left wall without new obstacles.
  rect(80, 218, 48, 10, '#61543c22');
  rect(80, 183, 44, 35, '#947854');
  rect(77, 179, 49, 6, '#ccb084');
  for (const x of [84, 104]) {
    rect(x, 189, 16, 23, '#ac8d63');
    rect(x + 6, 196, 3, 2, '#e5ce98');
  }
  rect(85, 168, 10, 11, '#83a3a0');
  rect(87, 164, 6, 4, '#aec9bd');
  rect(104, 174, 16, 4, '#eee0bf');
  rect(107, 170, 13, 4, colors.roof);
  // Plant, soft stool and a little cup.
  rect(101, 335, 22, 21, '#ad7e5e');
  rect(99, 331, 26, 6, '#c99a72');
  rect(110, 296, 3, 38, '#697f53');
  rect(94, 304, 19, 11, colors.grass);
  rect(112, 290, 21, 14, colors.light);
  rect(110, 318, 22, 10, colors.grass);
  const drawStation = (i: number) => {
    const s = STATIONS[i],
      q = point(s.x, s.y),
      w = s.width * 40;
    rect(q.x - w / 2 + 3, q.y + 8, w, 10, '#614c4328');
    if (i === 0) {
      rect(q.x - 37, q.y - 14, 5, 31, '#8d6d4c');
      rect(q.x + 32, q.y - 14, 5, 31, '#8d6d4c');
      rect(q.x - 48, q.y - 69, 96, 59, '#8b704f');
      rect(q.x - 43, q.y - 64, 86, 49, '#b4966a');
      rect(q.x - 34, q.y - 56, 41, 32, '#fff1cd');
      rect(q.x + 12, q.y - 49, 24, 24, colors.light);
      for (let j = 0; j < 4; j++) rect(q.x - 28, q.y - 49 + j * 6, 27 - j * 3, 2, '#b5a078');
      rect(q.x - 16, q.y - 57, 3, 3, colors.roof);
    } else if (i === 1) {
      rect(q.x - 43, q.y - 65, 86, 80, '#886a4d');
      rect(q.x - 38, q.y - 60, 76, 70, '#695440');
      for (let row = 0; row < 2; row++)
        for (let j = 0; j < 8; j++) {
          const h = 19 + (seed(p.identity + row + j) % 9);
          rect(
            q.x - 34 + j * 9,
            q.y - 30 + row * 35 - h,
            7,
            h,
            [colors.grass, colors.roof, '#d6b46d', '#8b9fa8'][j % 4],
          );
          rect(q.x - 32 + j * 9, q.y - 30 + row * 35 - h + 5, 3, 1, '#eee1bd');
        }
      rect(q.x - 40, q.y - 28, 80, 4, '#b29570');
    } else {
      rect(q.x - w / 2 + 6, q.y - 2, 6, 23, '#8a6c50');
      rect(q.x + w / 2 - 12, q.y - 2, 6, 23, '#8a6c50');
      rect(q.x - w / 2, q.y - 12, w, 15, '#b3936b');
      rect(q.x - w / 2, q.y - 18, w, 10, '#d4b68b');
      rect(q.x - 28, q.y - 63, 56, 38, '#405952');
      rect(q.x - 24, q.y - 59, 48, 30, i === 2 ? '#263f38' : colors.water);
      rect(q.x - 3, q.y - 25, 6, 8, '#5f7064');
      rect(q.x - 12, q.y - 19, 24, 3, '#5f7064');
      if (i === 2)
        for (let j = 0; j < 4; j++)
          rect(q.x - 17, q.y - 53 + j * 6, 15 + (j % 2) * 12, 2, j % 2 ? '#d6b577' : '#95b68a');
      else {
        rect(q.x - 18, q.y - 49, 36, 14, '#f6e8c5');
        text('▶', q.x, q.y - 38, 11, colors.accent);
      }
      rect(q.x - 19, q.y - 11, 38, 5, '#e6d8ba');
    }
    if (i >= 2) {
      // A ceramic mug and a gently rising two-pixel steam trail.
      rect(q.x + w / 2 - 17, q.y - 24, 8, 7, '#f1e3c5');
      rect(q.x + w / 2 - 9, q.y - 22, 3, 4, '#c8b68e');
      const steam = Math.floor(animation / 500) % 4;
      rect(q.x + w / 2 - 14, q.y - 28 - steam, 2, 3, '#eee5d58c');
      if (i === 2 && Math.floor(animation / 650) % 2 === 0)
        rect(q.x + 3, q.y - 34, 5, 2, '#c4dca5');
    }
    const nearby = Math.hypot(player.x - s.x, player.y - s.y) < 2.3;
    rect(q.x - w / 2 - 2, q.y + 24, w + 4, 15, nearby ? '#f6e7ba' : '#eee3c9');
    rect(q.x - w / 2 - 2, q.y + 38, w + 4, 2, '#a9926e');
    text(s.short.toUpperCase(), q.x, q.y + 34, 9);
    if (nearby) {
      rect(q.x - 3, q.y - 80, 6, 3, colors.accent);
      rect(q.x - 1, q.y - 77, 2, 3, colors.accent);
    }
  };
  const drawPlayer = () => {
    const q = point(player.x, player.y),
      bob = !p.reducedMotion && player.moving ? Math.sin(animation / 65) * 1.5 : 0;
    rect(q.x - 8, q.y + 3, 16, 4, '#5b604b35');
    rect(q.x - 6, q.y - 25 + bob, 12, 12, a.skin);
    rect(q.x - 7, q.y - 29 + bob, 14, 7, p.avatar === 'astronaut' ? '#ebe9db' : '#786346');
    rect(q.x - 10, q.y - 24 + bob, 20, 3, p.avatar === 'sailor' ? '#eceada' : '#c8ad70');
    rect(q.x - 6, q.y - 13 + bob, 12, 13, a.color);
    rect(q.x - 4, q.y - 18 + bob, 2, 2, '#35463f');
    rect(q.x + 3, q.y - 18 + bob, 2, 2, '#35463f');
    rect(q.x - 5, q.y, 4, 5 + bob, '#40564b');
    rect(q.x + 1, q.y, 4, 5 - bob, '#40564b');
  };
  [
    ...STATIONS.map((s, i) => ({ y: s.y, draw: () => drawStation(i) })),
    { y: player.y, draw: drawPlayer },
  ]
    .sort((a, b) => a.y - b.y)
    .forEach((o) => o.draw());
  const exit = point(ROOM_EXIT.x, ROOM_EXIT.y);
  rect(exit.x - 30, exit.y - 4, 60, 22, '#8c7557');
  rect(exit.x - 26, exit.y - 3, 52, 16, '#ebdfbf');
  text('EXIT ↓', exit.x, exit.y + 9, 10);
  if (p.lighting === 'night') {
    rect(64, 55, 512, 320, '#15243c18');
    rect(474, 73, 56, 32, '#172b40');
    for (const [x, y] of [
      [480, 78],
      [489, 93],
      [518, 79],
      [511, 98],
    ])
      rect(x, y, 2, 2, '#e4dfb9');
    rect(500, 72, 3, 35, '#b7b39d');
    rect(472, 88, 61, 3, '#b7b39d');
    rect(451, 84, 2, 36, '#9e8c6d');
    rect(441, 78, 22, 14, '#ebd297');
    c!.fillStyle = '#ffdc891c';
    c!.beginPath();
    c!.ellipse(452, 115, 31, 18, 0, 0, Math.PI * 2);
    c!.fill();
  }
}
