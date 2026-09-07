import { BUILDINGS, type BuildingId } from './buildings';
export type DecorTile = { x: number; y: number; w: number; h: number; color: string };
// Wall-mounted decorations keep all four interaction stations and their walkable paths intact.
export function roomDecor(kind: BuildingId): DecorTile[] {
  const theme = BUILDINGS[kind],
    tiles: DecorTile[] = [];
  const box = (x: number, y: number, w: number, h: number, color: string) =>
    tiles.push({ x, y, w, h, color });
  box(0, 0, 100, 68, theme.accent);
  box(4, 4, 92, 60, theme.wall);
  if (kind === 'cafe') {
    box(8, 14, 84, 44, '#426052');
    box(29, 28, 29, 21, '#f3dec0');
    box(57, 30, 11, 5, '#f3dec0');
    box(65, 32, 4, 11, '#f3dec0');
    box(57, 41, 11, 4, '#f3dec0');
    box(24, 52, 45, 3, '#f3dec0');
    for (const x of [36, 47]) box(x, 20, 2, 6, '#d8cdb2');
    for (let i = 0; i < 8; i++) box(6 + i * 11, 5, 11, 8, i % 2 ? theme.roof : '#f6e4c9');
  } else if (kind === 'observatory') {
    box(8, 8, 84, 52, '#2c4165');
    for (const [x, y] of [
      [18, 20],
      [35, 14],
      [72, 23],
      [60, 48],
      [25, 46],
    ]) {
      box(x, y, 2, 6, '#f0dfb4');
      box(x - 2, y + 2, 6, 2, '#f0dfb4');
    }
    box(44, 26, 22, 17, '#becde0');
    box(39, 32, 31, 3, '#dfb988');
    box(51, 26, 10, 17, '#92adc8');
  } else if (kind === 'workshop') {
    box(8, 8, 84, 52, '#b69a73');
    for (let y = 14; y < 58; y += 9) for (let x = 15; x < 87; x += 9) box(x, y, 2, 2, '#786d54');
    box(29, 25, 5, 25, '#6a7b71');
    box(19, 22, 24, 8, '#d7ded0');
    box(63, 21, 5, 29, '#d7ded0');
    box(56, 20, 19, 7, '#d7ded0');
    box(61, 17, 8, 7, '#b69a73');
  } else if (kind === 'library') {
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 8; i++)
        box(
          12 + i * 10,
          11 + row * 26 + (i % 3) * 2,
          7,
          21 - (i % 3) * 2,
          [theme.roof, '#809981', '#bead79', '#8d9eac'][i % 4],
        );
      box(9, 33 + row * 26, 82, 4, '#94714e');
    }
  } else if (kind === 'arcade') {
    box(7, 7, 86, 54, '#342d4e');
    const sprite = ['0100010', '0011100', '0111110', '1101011', '1111111', '1011101', '0100010'];
    sprite.forEach((row, y) =>
      [...row].forEach((v, x) => {
        if (v === '1') box(30 + x * 6, 12 + y * 6, 5, 5, y % 2 ? '#a5e4d5' : '#eab4e4');
      }),
    );
    box(11, 12, 3, 44, '#d391d0');
    box(86, 12, 3, 44, '#96d2ce');
  } else {
    box(18, 43, 64, 12, '#a2b885');
    box(34, 28, 31, 22, '#edcf9f');
    box(28, 24, 43, 6, theme.roof);
    box(38, 18, 23, 6, theme.roof);
    box(47, 38, 9, 12, '#836b4c');
  }
  return tiles;
}
