'use client';
import { useEffect, useRef } from 'react';
import { BUILDINGS, scenePalette } from '@/lib/buildings';
import { roomDecor } from '@/lib/room-decor';
import { AVATARS, PALETTES, seed } from '@/lib/island';
import { ROOM_EXIT, STATIONS } from '@/lib/room';
import type { RoomSceneProps } from './room-scene-types';
const point = (x: number, y: number) => ({ x: 320 + x * 40, y: 247 + y * 26 });
export default function PixelRoom(props: RoomSceneProps) {
  const canvas = useRef<HTMLCanvasElement>(null),
    latest = useRef(props);
  latest.current = props;
  useEffect(() => {
    const c = canvas.current?.getContext('2d');
    if (!c) return;
    let frame = 0,
      previous = 0;
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
    function draw(time: number) {
      const p = latest.current,
        theme = BUILDINGS[p.building],
        colors = { ...scenePalette(p.palette, p.lighting), accent: theme.accent, roof: theme.roof },
        a = AVATARS.find((a) => a.id === p.avatar)!;
      p.controller.current.step(previous ? (time - previous) / 1000 : 0);
      previous = time;
      const player = p.controller.current;
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
      rect(64, 55, 512, 73, theme.wall);
      rect(64, 119, 512, 9, '#a48a65');
      rect(64, 53, 512, 5, colors.accent);
      for (let x = 78; x < 575; x += 22) rect(x, 59, 1, 57, '#ddd5bf');
      rect(62, 55, 7, 320, '#a48a65');
      rect(572, 55, 7, 320, '#a48a65');
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
        text(s.short.toUpperCase(), q.x, q.y + 34, 9);
      };
      const drawPlayer = () => {
        const q = point(player.x, player.y),
          bob = !p.reducedMotion && player.moving ? Math.sin(time / 65) * 1.5 : 0;
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
      text(
        BUILDINGS[p.building].name.toUpperCase() + ' · A BIG IDEA.',
        320,
        427,
        10,
        p.lighting === 'night' ? '#dce1c8' : colors.accent,
      );
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
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <canvas
      ref={canvas}
      width={640}
      height={480}
      className="pixel-room-canvas"
      aria-label="Pixel project room. Use the station buttons below for keyboard access."
      onClick={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        const scale = Math.min(box.width / 640, box.height / 480);
        const x = (e.clientX - box.left - (box.width - 640 * scale) / 2) / scale,
          y = (e.clientY - box.top - (box.height - 480 * scale) / 2) / scale;
        const i = STATIONS.findIndex((s) => {
          const q = point(s.x, s.y);
          return Math.abs(x - q.x) < s.width * 20 + 8 && y > q.y - 75 && y < q.y + 38;
        });
        if (i >= 0) props.onInteract(i);
        else {
          const q = point(ROOM_EXIT.x, ROOM_EXIT.y);
          if (Math.abs(x - q.x) < 35 && Math.abs(y - q.y) < 20) props.onInteract(4);
        }
      }}
    />
  );
}
