import { BUILDINGS, buildingFor, scenePalette, type LightingId } from './buildings';
import { PLOTS, type Island, type PaletteId } from './island';

// Deterministic low-poly composition. Uses the same building styles and plots as the game.
export function IslandCardScene({
  island,
  palette,
  lighting,
  focus,
}: {
  island: Island;
  palette: PaletteId;
  lighting: LightingId;
  focus?: string;
}) {
  const p = scenePalette(palette, lighting),
    night = lighting === 'night';
  const project = (x: number, z: number) => ({ x: 265 + (x - z) * 19, y: 235 + (x + z) * 9 });
  const houses = island.projects
    .map((repo, i) => ({ repo, i, pos: project(PLOTS[i].x, PLOTS[i].y) }))
    .sort((a, b) => a.pos.y - b.pos.y);
  return (
    <svg width="540" height="480" viewBox="0 0 540 480">
      <rect width="540" height="480" fill={p.water} />
      {night && (
        <>
          <circle cx="450" cy="48" r="17" fill="#f5e4b9" />
          {[40, 98, 165, 222, 300, 365, 490].map((x, i) => (
            <circle key={x} cx={x} cy={28 + (i % 3) * 16} r="2" fill="#f7eed9" />
          ))}
        </>
      )}
      <ellipse cx="274" cy="308" rx="238" ry="128" fill={p.deep} />
      <ellipse cx="264" cy="285" rx="232" ry="122" fill="#b2a17d" />
      <ellipse cx="264" cy="274" rx="232" ry="122" fill="#e6d4ad" />
      <ellipse cx="264" cy="269" rx="216" ry="111" fill={p.grass} />
      <path
        d="M106 231 L369 354 M168 202 L431 324 M261 164 L134 340"
        stroke="#e5d5b4"
        strokeWidth="13"
        fill="none"
      />
      <path d="M163 344 L201 363 L153 407 L115 387 Z" fill="#a78a62" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M${157 - i * 7} ${351 + i * 6} l32 16`}
          stroke="#e8d7b0"
          strokeWidth="3"
        />
      ))}
      {[
        [-8, -2],
        [-6, -5],
        [-2, -6],
        [3, -5],
        [7, -2],
        [8, 2],
        [6, 5],
      ].map(([x, z], i) => {
        const q = project(x, z);
        return (
          <g key={i} transform={`translate(${q.x},${q.y})`}>
            <path d="M-3 -5 v-32 h7 v32" fill="#90734f" />
            <path d="M-24 -43 L-18 -64 L0 -76 L21 -64 L26 -43 L7 -29 L-12 -30 Z" fill={p.tree} />
            <path d="M-18 -64 L0 -76 L21 -64 L6 -46 L-24 -43 Z" fill={p.light} />
          </g>
        );
      })}
      {houses.map(({ repo, i, pos }) => {
        const kind = buildingFor(repo),
          t = BUILDINGS[kind],
          highlight = focus === `${repo.owner}/${repo.name}`.toLowerCase();
        return (
          <g key={repo.id} transform={`translate(${pos.x},${pos.y})`}>
            {highlight && (
              <ellipse
                cx="0"
                cy="18"
                rx="48"
                ry="23"
                fill="none"
                stroke={night ? '#ffe09e' : p.accent}
                strokeWidth="3"
              />
            )}
            <path d="M-34 13 L5 35 L50 9 L14 -9 Z" fill="#304d3933" />
            <path d="M-31 -34 L4 -15 L4 22 L-31 3 Z" fill={t.wall} />
            <path d="M4 -15 L37 -34 L37 3 L4 22 Z" fill={t.wall} />
            <path d="M4 -15 L37 -34 L37 3 L4 22 Z" fill="#173e3a25" />
            {kind === 'observatory' ? (
              <>
                <path d="M-34 -32 C-38 -82 34 -83 41 -33 L5 -11 Z" fill={t.roof} />
                <path d="M-7 -66 L16 -85 L24 -75 L1 -55 Z" fill="#c3d2d8" />
              </>
            ) : (
              <>
                <path
                  d={
                    kind === 'arcade' || kind === 'workshop'
                      ? 'M-37 -36 L0 -57 L43 -35 L5 -13 Z'
                      : 'M-37 -34 L-9 -70 L44 -37 L5 -11 Z'
                  }
                  fill={t.roof}
                />
                {kind !== 'arcade' && kind !== 'workshop' && (
                  <path d="M-9 -70 L-37 -34 L-1 -14 L22 -51 Z" fill="#ffffff20" />
                )}
              </>
            )}
            <path d="M-15 -9 L-4 -3 L-4 15 L-15 9 Z" fill="#886d4c" />
            <path
              d="M-26 -25 L-18 -21 L-18 -11 L-26 -15 Z M12 -11 L22 -17 L22 -7 L12 -1 Z"
              fill={night ? '#ffe6ab' : '#b3d0c6'}
            />
            {kind === 'cafe' && <path d="M-35 -25 L4 -4 L-2 3 L-41 -18 Z" fill={t.accent} />}
            {kind === 'arcade' && <path d="M9 -26 L31 -39 L31 -31 L9 -18 Z" fill="#ebafe0" />}
            <text
              x="0"
              y="52"
              textAnchor="middle"
              fill={night ? '#f5ead4' : '#284e41'}
              fontSize="11"
            >
              {repo.name.length > 17 ? repo.name.slice(0, 16) + '…' : repo.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
