'use client';
import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Code2,
  Monitor,
  Share2,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { PALETTES, type Project, type AvatarId, type PaletteId, type StyleId } from '@/lib/island';
import type { ProjectDetails } from '@/lib/project';
import { advanceRoom, nearestRoomTarget, ROOM_SPAWN, STATIONS, type StationId } from '@/lib/room';
import { BUILDINGS, buildingFor, scenePalette, type LightingId } from '@/lib/buildings';
import { useController } from './use-controller';
import { GuideCharacter } from './island-guide';
const PixelRoom = dynamic(() => import('./pixel-room'), {
  ssr: false,
  loading: () => <p className="room-graphics-note">Opening the room…</p>,
});
const ThreeRoom = dynamic(() => import('./three-room'), {
  ssr: false,
  loading: () => <p className="room-graphics-note">Opening the room…</p>,
});
const domain = { advance: advanceRoom, nearest: nearestRoomTarget };
const icons = [Sparkles, BookOpen, Code2, Monitor];
class RoomBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p className="room-graphics-note">
        The room’s graphics couldn’t load. All four stations are available below.
      </p>
    ) : (
      this.props.children
    );
  }
}
function ReadmeImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <p className="room-muted">This README image is unavailable.</p>
  ) : (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
export default function ProjectRoom({
  project,
  style,
  palette,
  lighting = 'day',
  avatar,
  reducedMotion,
  onExit,
  tour,
  stamps,
}: {
  project: Project;
  style: StyleId;
  palette: PaletteId;
  lighting?: LightingId;
  avatar: AvatarId;
  reducedMotion: boolean;
  onExit: () => void;
  stamps: { count: number; total: number };
  tour?: { step: number; total: number; onNext: () => void; onStop: () => void };
}) {
  const [station, setStation] = useState<StationId | null>(null),
    [details, setDetails] = useState<ProjectDetails | null>(null),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [retry, setRetry] = useState(0),
    [nearby, setNearby] = useState(-1),
    [message, setMessage] = useState('');
  const stage = useRef<HTMLDivElement>(null),
    panel = useRef<HTMLElement>(null),
    started = useRef(false);
  const interact = useCallback(
    (i: number) => {
      if (i === 4) onExit();
      else if (STATIONS[i]) setStation(STATIONS[i].id);
    },
    [onExit],
  );
  const controller = useController(0, interact, station !== null, domain);
  if (!started.current) {
    Object.assign(controller.current, ROOM_SPAWN);
    started.current = true;
  }
  useEffect(() => {
    stage.current?.focus();
    const poll = setInterval(() => setNearby(nearestRoomTarget(controller.current)), 100);
    return () => clearInterval(poll);
  }, [controller]);
  useEffect(() => {
    controller.current.keys.clear();
    if (station) panel.current?.focus();
    else stage.current?.focus();
  }, [station, controller]);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError('');
    fetch(`/api/project/${encodeURIComponent(project.owner)}/${encodeURIComponent(project.name)}`, {
      signal: abort.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'This project is unavailable.');
        return data as ProjectDetails;
      })
      .then(setDetails)
      .catch((e) => {
        if (!abort.signal.aborted) setError(e instanceof Error ? e.message : 'Please try again.');
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [project.owner, project.name, retry]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      if (station) setStation(null);
      else onExit();
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [station, onExit]);
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage('Room link copied.');
    } catch {
      setMessage('Copy the browser URL to share this room.');
    }
  }
  const selected = STATIONS.find((s) => s.id === station);
  const languageTotal = details?.languages.reduce((n, l) => n + l.bytes, 0) || 1;
  const building = buildingFor(project);
  const isDemo = project.owner === 'demo';
  const summary = details?.description || project.description;
  const readme = details?.readme;
  return (
    <main
      className={
        'project-room' +
        (lighting === 'night' ? ' room-night' : '') +
        (reducedMotion ? ' room-still' : '')
      }
      style={
        {
          '--room-accent': PALETTES[palette].accent,
          '--room-water': scenePalette(palette, lighting).water,
        } as React.CSSProperties
      }
    >
      <header className="room-header" inert={station !== null}>
        <button className="room-back" onClick={onExit}>
          <ArrowLeft size={18} />
          <span>Back to island</span>
        </button>
        <div className="room-identity">
          <span>{isDemo ? 'SAMPLE PROJECT ROOM' : `@${project.owner} / PROJECT ROOM`}</span>
          <h1>{project.name}</h1>
        </div>
        <button className="room-share" onClick={share}>
          <Share2 size={16} />
          <span>Share room</span>
        </button>
      </header>
      <section
        className="room-tour"
        inert={station !== null}
        aria-label={tour ? 'Guided tour' : 'Exploration passport'}
      >
        {tour && <GuideCharacter />}
        <div>
          <strong>
            {tour ? `Pip’s tour · Room ${tour.step} of ${tour.total}` : 'Room stamp collected'}
          </strong>
          <p>
            {tour
              ? 'Take a look around. Open any station, then continue when you’re ready.'
              : stamps.total > 0 && stamps.count === stamps.total
                ? 'Passport complete! Return to the island to download your souvenir.'
                : `${stamps.count} / ${stamps.total} passport stamps · Visit every room to unlock your souvenir.`}
          </p>
        </div>
        {tour && (
          <>
            <button className="tour-stop" onClick={tour.onStop}>
              Leave tour
            </button>
            <button className="tour-next" onClick={tour.onNext}>
              {tour.step === tour.total ? 'Finish tour' : 'Next room →'}
            </button>
          </>
        )}
      </section>
      <div className={'room-layout' + (station ? ' reading' : '')}>
        <div className="room-world-column" inert={station !== null}>
          <div
            className="room-world"
            ref={stage}
            tabIndex={0}
            aria-label="Walkable project room. Walk with WASD or arrow keys. Press Enter or E near an object. Escape returns to the island."
          >
            <div className="room-scene-caption">
              <span className="eyebrow">STEP INSIDE THE STORY</span>
              <span>
                {BUILDINGS[building].name} ·{' '}
                {style === 'pixel' ? 'Pixel interior' : 'Miniature interior'}
              </span>
            </div>
            <div className="room-render">
              <RoomBoundary>
                <>
                  {style === 'pixel' ? (
                    <PixelRoom
                      identity={`${project.owner}/${project.name}`}
                      palette={palette}
                      lighting={lighting}
                      building={building}
                      avatar={avatar}
                      controller={controller}
                      reducedMotion={reducedMotion}
                      onInteract={interact}
                    />
                  ) : (
                    <ThreeRoom
                      identity={`${project.owner}/${project.name}`}
                      palette={palette}
                      lighting={lighting}
                      building={building}
                      avatar={avatar}
                      controller={controller}
                      reducedMotion={reducedMotion}
                      onInteract={interact}
                    />
                  )}
                </>
              </RoomBoundary>
            </div>
            <div className="room-touch-controls" aria-label="Room movement controls">
              {[
                ['up', '↑'],
                ['left', '←'],
                ['down', '↓'],
                ['right', '→'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={'walk-' + key}
                  aria-label={`Walk ${key}`}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    controller.current.keys.add('arrow' + key);
                  }}
                  onPointerUp={() => controller.current.keys.delete('arrow' + key)}
                  onPointerCancel={() => controller.current.keys.clear()}
                  onLostPointerCapture={() => controller.current.keys.delete('arrow' + key)}
                  onClick={() => {
                    const c = controller.current;
                    c.keys.add('arrow' + key);
                    c.step(0.05);
                    c.keys.delete('arrow' + key);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      controller.current.keys.add('arrow' + key);
                    }
                  }}
                  onKeyUp={() => controller.current.keys.delete('arrow' + key)}
                  onBlur={() => controller.current.keys.delete('arrow' + key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="room-interact">
              {nearby >= 0 ? (
                <button onClick={() => interact(nearby)}>
                  <kbd>Enter</kbd>
                  <span>{nearby === 4 ? 'Back to island' : STATIONS[nearby].title}</span>
                  <ArrowUpRight size={15} />
                </button>
              ) : (
                <span>Walk up to an object, or choose a station below.</span>
              )}
            </div>
          </div>
          <nav className="room-stations" aria-label="Project stations">
            {STATIONS.map((s, i) => {
              const Icon = icons[i];
              return (
                <button key={s.id} onClick={() => setStation(s.id)} aria-pressed={station === s.id}>
                  <Icon size={21} />
                  <span>
                    <strong>{s.short}</strong>
                    <small>{s.caption}</small>
                  </span>
                  <ArrowUpRight size={15} />
                </button>
              );
            })}
          </nav>
          <div className="room-footer">
            <span>
              <kbd>WASD</kbd> / arrows to walk · <kbd>Enter</kbd> or <kbd>E</kbd> to discover
            </span>
            <span role="status">
              {message ||
                (loading
                  ? 'Loading project details…'
                  : isDemo
                    ? 'Fictional sample · explore freely'
                    : 'Built from public GitHub information')}
            </span>
          </div>
        </div>
        {station && (
          <section
            className="room-panel"
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="station-title"
            onKeyDown={(e) => {
              if (e.key !== 'Tab') return;
              const nodes = Array.from(
                e.currentTarget.querySelectorAll<HTMLElement>(
                  'button:not(:disabled),a[href],input,[tabindex="0"]',
                ),
              );
              const first = nodes[0],
                last = nodes[nodes.length - 1];
              if (
                e.shiftKey &&
                (document.activeElement === first || document.activeElement === panel.current)
              ) {
                e.preventDefault();
                last?.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
              }
            }}
          >
            <header className="room-panel-header">
              <div>
                <span className="eyebrow">{project.name}</span>
                <h2 id="station-title">{selected?.title}</h2>
              </div>
              <button
                className="room-panel-close"
                aria-label="Close project details"
                onClick={() => setStation(null)}
              >
                <X size={20} />
              </button>
            </header>
            <div className="room-panel-content">
              {loading && (
                <p role="status" className="room-muted">
                  Bringing the project’s story into the room…
                </p>
              )}
              {error && (
                <div className="room-notice" role="alert">
                  <p>{error}</p>
                  <button onClick={() => setRetry((r) => r + 1)}>Try again</button>
                </div>
              )}
              {details?.notice && <p className="room-notice">{details.notice}</p>}
              {isDemo && (
                <p className="room-notice">
                  This is a fictional sample. Real rooms show their repository’s own content.
                </p>
              )}
              {station === 'overview' && (
                <>
                  <div className="room-overview-icon">
                    <Sparkles size={28} />
                  </div>
                  <h3>{project.name}</h3>
                  <p className="room-lead">
                    {summary || 'This repository has no description yet.'}
                  </p>
                  <div className="room-facts">
                    <span>
                      <Star size={15} />
                      {(details?.stars ?? project.stars).toLocaleString()} stars
                    </span>
                    <span>{details?.license || 'License not specified'}</span>
                    <span>
                      Updated{' '}
                      {new Date(details?.updatedAt || project.updatedAt).toLocaleDateString('en', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {readme?.introduction && (
                    <>
                      <h4>From the README</h4>
                      <p className="source-excerpt">{readme.introduction}</p>
                    </>
                  )}
                  {readme?.features && (
                    <>
                      <h4>Features & highlights</h4>
                      <p className="source-excerpt">{readme.features}</p>
                    </>
                  )}
                  {!isDemo && (
                    <a
                      className="room-link"
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Explore on GitHub <ArrowUpRight size={16} />
                    </a>
                  )}
                </>
              )}
              {station === 'readme' && readme && (
                <>
                  {readme.status === 'missing' ? (
                    <p className="room-muted">This repository doesn’t have a README yet.</p>
                  ) : readme.status === 'unavailable' ? (
                    <div className="room-notice">
                      <p>The README is temporarily unavailable.</p>
                      <button onClick={() => setRetry((r) => r + 1)}>Try again</button>
                    </div>
                  ) : (
                    <div
                      className="room-markdown"
                      dangerouslySetInnerHTML={{ __html: readme.html }}
                      onClick={(e) => {
                        const link = (e.target as HTMLElement).closest('a');
                        if (link?.getAttribute('href')?.startsWith('#')) {
                          e.preventDefault();
                          const id = link.getAttribute('href')!.slice(1);
                          const heading = document.getElementById(id);
                          if (heading && e.currentTarget.contains(heading))
                            heading.scrollIntoView({ block: 'start' });
                        }
                      }}
                    />
                  )}
                  {readme.truncated && (
                    <p className="room-notice">
                      This README is too large to show in full here. Continue reading on GitHub.
                    </p>
                  )}
                  {!isDemo && (
                    <a
                      className="room-link"
                      href={readme.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read on GitHub <ArrowUpRight size={16} />
                    </a>
                  )}
                </>
              )}
              {station === 'technology' && details && (
                <>
                  <h3>Language mix</h3>
                  <p className="room-muted">GitHub’s breakdown by code size.</p>
                  {details.languageStatus === 'unavailable' ? (
                    <div className="room-notice">
                      <p>Language information is temporarily unavailable.</p>
                      <button onClick={() => setRetry((r) => r + 1)}>Try again</button>
                    </div>
                  ) : details.languages.length ? (
                    <div className="language-list">
                      {details.languages.map((l, i) => (
                        <div key={l.name}>
                          <div>
                            <strong>{l.name}</strong>
                            <span>{((l.bytes / languageTotal) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="language-track">
                            <span
                              style={{
                                width: `${(l.bytes / languageTotal) * 100}%`,
                                background: ['#689276', '#bc9666', '#8a86ab', '#78a4ac'][i % 4],
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="room-muted">
                      GitHub hasn’t reported a language breakdown for this repository.
                    </p>
                  )}
                  <h4>Repository topics</h4>
                  <div className="room-topics">
                    {details.topics.length ? (
                      details.topics.map((t) => <span key={t}>{t}</span>)
                    ) : (
                      <p className="room-muted">No topics have been added yet.</p>
                    )}
                  </div>
                </>
              )}
              {station === 'demo' && (
                <>
                  <h3>A closer look</h3>
                  <p className="room-muted">
                    Images and links from the project. The website opens in a new tab.
                  </p>
                  {readme?.images.length ? (
                    <div className="room-gallery">
                      <h4>README images</h4>
                      {readme.images.map((image) => (
                        <figure key={image.src}>
                          <ReadmeImage {...image} />
                          <figcaption>{image.alt}</figcaption>
                        </figure>
                      ))}
                    </div>
                  ) : (
                    !loading && (
                      <p className="room-notice">
                        {readme?.status === 'unavailable'
                          ? 'README images are temporarily unavailable.'
                          : 'No README images are available for this project.'}
                      </p>
                    )
                  )}
                  {!isDemo && (
                    <div className="room-demo-links">
                      {details?.homepage || project.homepage ? (
                        <a
                          className="room-link"
                          href={details?.homepage || project.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit project website <ArrowUpRight size={16} />
                        </a>
                      ) : (
                        <p className="room-muted">
                          This repository hasn’t listed a project website.
                        </p>
                      )}
                      <a
                        className="room-link secondary"
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View source on GitHub <ArrowUpRight size={16} />
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
