import { BUILDINGS, BUILDING_IDS, buildingFor, scenePalette, type LightingId } from './buildings';
import { ImageResponse } from 'next/og';
import { PALETTES, PaletteId, type Island } from './island';
export function socialCard(
  username: string,
  palette: PaletteId = 'lagoon',
  island?: Island,
  lighting: LightingId = 'day',
) {
  const p = scenePalette(palette, lighting),
    night = lighting === 'night';
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
            fontSize:
              island && username.length > 26 ? 22 : island && username.length > 16 ? 32 : 61,
            lineHeight: 1.05,
            letterSpacing: -2,
            marginTop: 40,
          }}
        >
          {island ? (username === 'demo' ? 'Alex’s island.' : `@${username}`) : 'Your code.'}
        </div>
        <div style={{ fontSize: 61, lineHeight: 1.05, letterSpacing: -3, color: '#7c9078' }}>
          {island ? 'Come explore.' : 'A world of its own.'}
        </div>
        <div style={{ fontSize: 23, marginTop: 30, color: '#7f8b77' }}>
          {username === 'demo'
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
        {night && (
          <>
            {Array.from({ length: 14 }, (_, i) => (
              <div
                key={'star' + i}
                style={{
                  display: 'flex',
                  position: 'absolute',
                  left: 24 + i * 36,
                  top: 20 + (i % 3) * 13,
                  width: 3,
                  height: 3,
                  background: '#eae3c4',
                  borderRadius: '50%',
                }}
              />
            ))}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                top: 29,
                right: 34,
                width: 22,
                height: 22,
                background: '#eddfb3',
                borderRadius: '50%',
              }}
            />
          </>
        )}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 75,
            left: 24,
            width: 490,
            height: 330,
            borderRadius: '50%',
            background: night ? '#7b8878' : '#e9d9b0',
            border: night ? '12px solid #425d67' : '12px solid #d3e2cd',
          }}
        />
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 83,
            left: 43,
            width: 452,
            height: 297,
            borderRadius: '50%',
            background: p.light,
          }}
        />
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            left: 257,
            top: 127,
            width: 23,
            height: 275,
            background: '#e0c99e',
          }}
        />
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            left: 270,
            top: 352,
            width: 32,
            height: 90,
            background: '#ae8d60',
          }}
        />
        {Array.from({ length: island ? island.projects.length : 6 }, (_, i) => {
          const kind = island ? buildingFor(island.projects[i]) : BUILDING_IDS[i],
            theme = BUILDINGS[kind];
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                position: 'absolute',
                left: 100 + (i % 3) * 122,
                top: 142 + Math.floor(i / 3) * 115,
                width: 64,
                height: 58,
                background: theme.wall,
                borderBottom: '7px solid #d8c49b',
                boxShadow: '7px 8px 0 #859a6c55',
              }}
            >
              {island && (
                <div
                  style={{
                    display: 'flex',
                    position: 'absolute',
                    top: 65,
                    left: -25,
                    width: 114,
                    justifyContent: 'center',
                    fontSize: 12,
                    color: night ? '#f2e4bd' : p.accent,
                  }}
                >
                  {island.projects[i].name.length > 16
                    ? island.projects[i].name.slice(0, 15) + '…'
                    : island.projects[i].name}
                </div>
              )}
              <svg
                width="80"
                height="36"
                viewBox="0 0 80 36"
                style={{ position: 'absolute', left: -8, top: -34 }}
              >
                <path
                  d={
                    kind === 'observatory'
                      ? 'M0 36 A40 36 0 0 1 80 36 Z'
                      : kind === 'workshop' || kind === 'arcade'
                        ? 'M0 18 H80 V36 H0 Z'
                        : 'M0 36 L40 0 L80 36 Z'
                  }
                  fill={theme.roof}
                />
                {kind === 'observatory' && <path d="M43 6 L64 0 L67 7 L46 13 Z" fill="#cedde7" />}
                {kind === 'arcade' && <path d="M12 24 H68 V31 H12 Z" fill="#edb4df" />}
              </svg>
              <div
                style={{
                  display: 'flex',
                  position: 'absolute',
                  left: 26,
                  top: 28,
                  width: 13,
                  height: 25,
                  background: '#8c7a59',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  position: 'absolute',
                  left: 8,
                  top: 13,
                  width: 12,
                  height: 15,
                  background: night ? '#ffe09e' : '#a3bbb0',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  position: 'absolute',
                  right: 8,
                  top: 13,
                  width: 12,
                  height: 15,
                  background: night ? '#ffe09e' : '#a3bbb0',
                }}
              />
              {kind === 'cafe' && (
                <div
                  style={{
                    display: 'flex',
                    position: 'absolute',
                    top: 0,
                    left: -5,
                    width: 74,
                    height: 10,
                  }}
                >
                  {Array.from({ length: 8 }, (_, stripe) => (
                    <div
                      key={stripe}
                      style={{
                        display: 'flex',
                        width: 10,
                        height: 10,
                        background: stripe % 2 ? theme.accent : '#faecd4',
                      }}
                    />
                  ))}
                </div>
              )}
              {kind === 'library' &&
                [-1, 1].map((side) => (
                  <div
                    key={side}
                    style={{
                      display: 'flex',
                      position: 'absolute',
                      left: side < 0 ? 0 : 59,
                      top: 3,
                      width: 5,
                      height: 48,
                      background: '#f9efd6',
                    }}
                  />
                ))}
            </div>
          );
        })}
      </div>
    </div>,
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=86400' } },
  );
}
