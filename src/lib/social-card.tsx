import { scenePalette, type LightingId } from './buildings';
import { ImageResponse } from 'next/og';
import { PaletteId, type Island, type Project } from './island';
import { IslandCardScene } from './island-card-scene';
import { DEMO } from './demo';
export function socialCard(
  username: string,
  palette: PaletteId = 'lagoon',
  island?: Island,
  lighting: LightingId = 'day',
  room?: Project,
) {
  const p = scenePalette(palette, lighting);
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: '#f8f7f1',
        padding: 55,
        color: '#263f35',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{ display: 'flex', flexDirection: 'column', width: 525, justifyContent: 'center' }}
      >
        <div style={{ fontSize: 25, letterSpacing: -1, color: '#205c50' }}>dev island.</div>
        <div
          style={{
            fontSize: room
              ? 34
              : island && username.length > 26
                ? 22
                : island && username.length > 16
                  ? 32
                  : 61,
            lineHeight: 1.05,
            letterSpacing: -2,
            marginTop: 40,
          }}
        >
          {room
            ? room.name.length > 42
              ? room.name.slice(0, 41) + '…'
              : room.name
            : island
              ? username.toLowerCase() === 'demo'
                ? 'Alex’s island.'
                : `@${username}`
              : 'Your code.'}
        </div>
        <div style={{ fontSize: 61, lineHeight: 1.05, letterSpacing: -3, color: '#7c9078' }}>
          {room ? 'Step inside.' : island ? 'Come explore.' : 'A world of its own.'}
        </div>
        <div style={{ fontSize: 23, marginTop: 30, color: '#7f8b77' }}>
          {room
            ? room.description.slice(0, 130)
            : username.toLowerCase() === 'demo'
              ? 'A playable world of what you build.'
              : `Explore @${username}’s island.`}
        </div>
        <div style={{ fontSize: 16, marginTop: 40, color: '#83937d' }}>
          {island
            ? `${island.projects.length} PROJECT ROOMS · CLICK TO VISIT`
            : 'WANDER · DISCOVER · MAKE IT YOURS'}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: 540,
          height: 480,
          alignSelf: 'center',
          background: p.water,
          borderRadius: 24,
          overflow: 'hidden',
        }}
      >
        <IslandCardScene
          island={island ?? DEMO}
          palette={palette}
          lighting={lighting}
          focus={room ? `${room.owner}/${room.name}`.toLowerCase() : undefined}
        />
      </div>
    </div>,
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=86400' } },
  );
}
