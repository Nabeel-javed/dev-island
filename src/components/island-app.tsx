'use client';
import dynamic from 'next/dynamic';
import { Component, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Code2,
  Compass,
  Download,
  Grid2X2,
  Layers3,
  Leaf,
  MapPin,
  Share2,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import {
  AVATARS,
  AvatarId,
  compact,
  Island,
  PALETTES,
  PLOTS,
  PaletteId,
  readAppearance,
  StyleId,
  validUsername,
} from '@/lib/island';
import { useController } from './use-controller';
import { usePassport } from './use-passport';
import IslandGuide from './island-guide';
import ExplorerPassport from './explorer-passport';
import { projectKey } from '@/lib/project';
const ProfileCard = dynamic(() => import('./profile-card'), { ssr: false });
const ProjectRoom = dynamic(() => import('./project-room'), { ssr: false });
const Pixel = dynamic(() => import('./pixel-island'), { ssr: false });
const Three = dynamic(() => import('./three-island'), { ssr: false });
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-fallback">
        <Compass size={32} />
        <h3>This view couldn’t load</h3>
        <p>Try the other style, or explore the projects below.</p>
      </div>
    ) : (
      this.props.children
    );
  }
}
function Logo() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="#205c50" />
      <path d="m8 26 12-6 12 6-12 6-12-6Z" fill="#d5c799" />
      <path d="m9 23 11-6 11 6-11 6-11-6Z" fill="#9cbe87" />
      <path d="M20 9v13m0-13 8 3-8 3" stroke="#f7ecd0" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
export default function IslandApp({
  island,
  initialAppearance = readAppearance(new URLSearchParams()),
}: {
  island: Island;
  initialAppearance?: ReturnType<typeof readAppearance>;
}) {
  const [style, setStyle] = useState<StyleId>(initialAppearance.style),
    [palette, setPalette] = useState<PaletteId>(initialAppearance.palette),
    [avatar, setAvatar] = useState<AvatarId>(initialAppearance.avatar);
  const [selected, setSelected] = useState<number | null>(null),
    [ready, setReady] = useState(false),
    [reducedMotion, setReducedMotion] = useState(false),
    [guideOpen, setGuideOpen] = useState(false),
    [cardOpen, setCardOpen] = useState(false),
    [tourStep, setTourStep] = useState<number | null>(null),
    [toast, setToast] = useState(''),
    [username, setUsername] = useState(''),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(false),
    [about, setAbout] = useState(false);
  const { visited, collect, persistent } = usePassport(island);
  const tourTotal = Math.min(3, island.projects.length);
  const stage = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLDialogElement>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const select = useCallback(
    (i: number, replace = false) => {
      const p = island.projects[i];
      if (!p) return;
      const url = new URL(window.location.href);
      url.searchParams.set('project', projectKey(p.owner, p.name));
      window.history[replace ? 'replaceState' : 'pushState'](
        { ...window.history.state, devIslandRoom: true },
        '',
        url,
      );
      setSelected(i);
      collect(i);
    },
    [island.projects, collect],
  );
  const controller = useController(
    island.projects.length,
    select,
    selected !== null || about || guideOpen || cardOpen,
  );
  const onReady = useCallback(() => setReady(true), []);
  const restoreDoorway = useCallback(() => {
    const i = selectedRef.current;
    if (i !== null && PLOTS[i]) {
      Object.assign(controller.current, { x: PLOTS[i].x, y: PLOTS[i].y + 1.5, moving: false });
      controller.current.keys.clear();
      setReady(false);
    }
  }, [controller]);
  const exitRoom = useCallback(() => {
    setTourStep(null);
    restoreDoorway();
    if (window.history.state?.devIslandRoom) window.history.back();
    else {
      const url = new URL(window.location.href);
      url.searchParams.delete('project');
      window.history.replaceState({ ...window.history.state, devIslandRoom: false }, '', url);
      setSelected(null);
    }
  }, [restoreDoorway]);
  useEffect(() => {
    const sync = () => {
      setTourStep(null);
      const url = new URL(window.location.href),
        key = url.searchParams.get('project');
      const index = key
        ? island.projects.findIndex((p) => projectKey(p.owner, p.name) === key.toLowerCase())
        : -1;
      if (index >= 0) {
        setSelected(index);
        collect(index);
      } else {
        restoreDoorway();
        setSelected(null);
        if (key) {
          url.searchParams.delete('project');
          window.history.replaceState({ ...window.history.state, devIslandRoom: false }, '', url);
          setToast('That room is not among this island’s featured projects.');
        }
      }
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [island.projects, restoreDoorway, collect]);
  const hadRoom = useRef(false);
  useEffect(() => {
    if (selected !== null) hadRoom.current = true;
    else if (hadRoom.current) {
      hadRoom.current = false;
      stage.current?.scrollIntoView({ block: 'center' });
      stage.current?.focus({ preventScroll: true });
    }
  }, [selected]);
  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(q.matches);
    const update = () => setReducedMotion(q.matches);
    q.addEventListener('change', update);
    return () => {
      q.removeEventListener('change', update);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    if (about) dialog.current?.showModal();
    else dialog.current?.close();
  }, [about]);
  const notify = (s: string) => {
    setToast(s);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 3500);
  };
  function appearance(next: { style?: StyleId; palette?: PaletteId; avatar?: AvatarId }) {
    const s = next.style ?? style,
      p = next.palette ?? palette,
      a = next.avatar ?? avatar;
    if (s !== style) setReady(false);
    setStyle(s);
    setPalette(p);
    setAvatar(a);
    const url = new URL(window.location.href);
    url.searchParams.set('style', s);
    url.searchParams.set('palette', p);
    url.searchParams.set('avatar', a);
    window.history.replaceState({}, '', url);
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify('Island link copied. Send a little escape.');
    } catch {
      notify('Copy the URL from your browser to share this island.');
    }
  }
  async function download() {
    const canvas = stage.current?.querySelector('canvas');
    if (!canvas) {
      notify('Your island is still arriving. Try again in a moment.');
      return;
    }
    try {
      const image = document.createElement('canvas');
      image.width = 1600;
      image.height = 1150;
      const c = image.getContext('2d')!;
      c.fillStyle = '#f7f6ef';
      c.fillRect(0, 0, 1600, 1150);
      c.fillStyle = '#234f43';
      c.font = 'bold 36px sans-serif';
      c.fillText(`${island.name}’s island`, 60, 68);
      c.font = '20px sans-serif';
      c.fillStyle = '#737a6c';
      c.fillText(
        island.source === 'demo' ? 'DEV ISLAND · SAMPLE WORLD' : `DEV ISLAND · @${island.login}`,
        60,
        103,
      );
      const ratio = canvas.width / canvas.height;
      const h = Math.min(940, 1480 / ratio),
        w = h * ratio;
      c.drawImage(canvas, (1600 - w) / 2, 135 + (940 - h) / 2, w, h);
      c.font = '18px sans-serif';
      c.fillStyle = '#546b5b';
      c.fillText('Your code, a world of its own.', 60, 1110);
      image.toBlob((blob) => {
        if (!blob) {
          notify('Image export failed. Please try again.');
          return;
        }
        const url = URL.createObjectURL(blob),
          a = document.createElement('a');
        a.href = url;
        a.download = `dev-island-${island.login}-${style}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        notify('Your island postcard is ready.');
      }, 'image/png');
    } catch {
      notify('Image export is unavailable in this browser.');
    }
  }
  async function generate(e: React.FormEvent) {
    e.preventDefault();
    const u = username.trim().replace(/^@/, '');
    if (!validUsername(u)) {
      setError('Enter a valid GitHub username.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/island/${encodeURIComponent(u)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not find this island.');
      window.location.href = `/u/${encodeURIComponent(u)}?style=${style}&palette=${palette}&avatar=${avatar}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
      setLoading(false);
    }
  }
  const project = selected === null ? null : island.projects[selected];
  const stars = island.projects.reduce((n, p) => n + p.stars, 0);
  if (project)
    return (
      <ProjectRoom
        key={projectKey(project.owner, project.name)}
        project={project}
        style={style}
        palette={palette}
        avatar={avatar}
        reducedMotion={reducedMotion}
        onExit={exitRoom}
        stamps={{ count: visited.length, total: island.projects.length }}
        tour={
          tourStep === null
            ? undefined
            : {
                step: tourStep + 1,
                total: tourTotal,
                onNext: () => {
                  if (tourStep + 1 >= tourTotal) exitRoom();
                  else {
                    setTourStep(tourStep + 1);
                    select(tourStep + 1, true);
                  }
                },
                onStop: () => setTourStep(null),
              }
        }
      />
    );
  return (
    <>
      <header className="site-header">
        <a href="/" className="brand">
          <Logo />
          <span>
            dev island<span className="brand-dot">.</span>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#explore" className="nav-active">
            Explore
          </a>
          <button onClick={() => setAbout(true)}>How it works</button>
          <span className="preview-badge">
            <span /> Preview edition
          </span>
        </nav>
        <a className="header-cta" href="#create">
          Create your island <ArrowUpRight size={16} />
        </a>
      </header>
      <main>
        <section className="intro" id="create">
          <div>
            <div className="eyebrow">
              <span /> A SMALL WORLD OF WHAT YOU BUILD
            </div>
            <h1>
              Your code.
              <br />
              <span>A world of its own.</span>
            </h1>
            <p>
              Turn your GitHub into a little island worth exploring.
              <br className="desktop-break" /> Every project has a place. Every contribution grows
              something.
            </p>
          </div>
          <div className="create-box">
            <div className="create-kicker">
              <Compass size={17} /> Your next adventure starts here
            </div>
            <form onSubmit={generate}>
              <label className="sr-only" htmlFor="username">
                GitHub username
              </label>
              <span className="input-prefix">github.com/</span>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your-username"
                autoComplete="off"
                spellCheck={false}
                maxLength={39}
              />
              <button type="submit" disabled={loading} aria-label="Generate island">
                {loading ? <span className="spinner" /> : <ArrowRight size={20} />}
              </button>
            </form>
            <div className="form-note">
              {error ? (
                <span role="alert" className="form-error">
                  {error}
                </span>
              ) : (
                <>
                  <span className="tiny-check">✓</span> No sign-up. Just your public GitHub.
                </>
              )}
            </div>
          </div>
        </section>
        <section className="explorer" id="explore" aria-label="Island explorer">
          <div className="explorer-heading">
            <div className="island-title">
              <span className="island-icon">
                <Leaf size={21} />
              </span>
              <div>
                <h2>
                  {island.source === 'demo' ? 'Alex’s' : island.name + '’s'} island{' '}
                  <span className="sample-tag">
                    {island.source === 'demo' ? 'SAMPLE WORLD' : 'PUBLIC PROFILE'}
                  </span>
                </h2>
                <p>
                  {island.source === 'demo'
                    ? 'A little inspiration for your own corner of the internet.'
                    : `A little corner of the internet, grown by @${island.login}.`}
                </p>
              </div>
            </div>
            <div className="style-toggle" aria-label="Choose island style">
              <button
                aria-pressed={style === 'pixel'}
                onClick={() => appearance({ style: 'pixel' })}
              >
                <Grid2X2 size={16} /> Pixel island
              </button>
              <button aria-pressed={style === '3d'} onClick={() => appearance({ style: '3d' })}>
                <Layers3 size={16} /> Miniature 3D
              </button>
            </div>
          </div>
          <div className="island-layout">
            <div className="world-column">
              <div
                className="world-stage"
                style={{ background: PALETTES[palette].water }}
                ref={stage}
                tabIndex={0}
                aria-label="Interactive island. Use arrow keys to walk and Enter or E to open a nearby project."
              >
                <div className="world-topline">
                  <span className="live-pill">
                    <span />
                    {style === 'pixel' ? 'THE PIXEL ARCHIPELAGO' : 'A WORLD IN MINIATURE'}
                  </span>
                  <span className="coordinate">
                    {style === 'pixel' ? '01' : '02'} / EXPLORATIONS
                  </span>
                </div>
                <SceneBoundary key={style}>
                  <>
                    {style === 'pixel' ? (
                      <Pixel
                        island={island}
                        palette={palette}
                        avatar={avatar}
                        controller={controller}
                        onSelect={select}
                        reducedMotion={reducedMotion}
                        onReady={onReady}
                      />
                    ) : (
                      <Three
                        island={island}
                        palette={palette}
                        avatar={avatar}
                        controller={controller}
                        onSelect={select}
                        reducedMotion={reducedMotion}
                        onReady={onReady}
                      />
                    )}
                  </>
                </SceneBoundary>
                {!ready && (
                  <div className="world-loading">
                    <span className="spinner" /> Growing your little world…
                  </div>
                )}
                <IslandGuide
                  island={island}
                  onOpenChange={setGuideOpen}
                  onStart={() => {
                    setTourStep(0);
                    select(0);
                  }}
                />
                <div className="world-bottomline">
                  <span className="world-hint">
                    <span className="hint-dot" /> Click a building to discover a project
                  </span>
                  <button
                    className="postcard-button"
                    onClick={download}
                    aria-label="Download island postcard"
                    title="Download postcard"
                  >
                    <Download size={16} />
                  </button>
                </div>
                <div className="mobile-dpad" aria-label="Movement controls">
                  {[
                    ['up', '↑'],
                    ['left', '←'],
                    ['down', '↓'],
                    ['right', '→'],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      aria-label={`Walk ${key}`}
                      className={'dpad-' + key}
                      onClick={() => {
                        const c = controller.current;
                        const held = c.keys.has('arrow' + key);
                        c.keys.add('arrow' + key);
                        c.step(0.04);
                        if (!held) c.keys.delete('arrow' + key);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          controller.current.keys.add('arrow' + key);
                        }
                      }}
                      onKeyUp={(e) => {
                        if (e.key === ' ' || e.key === 'Enter')
                          controller.current.keys.delete('arrow' + key);
                      }}
                      onBlur={() => controller.current.keys.delete('arrow' + key)}
                      onPointerDown={(e) => {
                        e.currentTarget.setPointerCapture(e.pointerId);
                        controller.current.keys.add('arrow' + key);
                      }}
                      onPointerUp={() => controller.current.keys.delete('arrow' + key)}
                      onPointerCancel={() => controller.current.keys.clear()}
                      onLostPointerCapture={() => controller.current.keys.delete('arrow' + key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="control-strip">
                <span>
                  <kbd>W</kbd>
                  <kbd>A</kbd>
                  <kbd>S</kbd>
                  <kbd>D</kbd>
                  <span>or arrow keys to wander</span>
                </span>
                <span>
                  <kbd>Enter</kbd> or <kbd>E</kbd> open a nearby project
                </span>
                <span className="explore-progress">
                  <span />
                  {visited.length} / {island.projects.length} explored
                </span>
              </div>
            </div>
            <aside className="passport">
              <div className="passport-top">
                <span className="eyebrow">ISLAND PASSPORT</span>
                <Compass size={19} />
              </div>
              <div className="profile-identity">
                <div className={'avatar-preview avatar-' + avatar}>
                  <span className="avatar-hat" />
                  <span className="avatar-face" />
                  <span
                    className="avatar-body"
                    style={{ background: AVATARS.find((a) => a.id === avatar)?.color }}
                  />
                  <span className="avatar-feet" />
                </div>
                <h3>{island.name}</h3>
                <span className="profile-handle">
                  {island.source === 'demo'
                    ? '@alex-morgan · fictional profile'
                    : `@${island.login}`}
                </span>
                <p>{island.bio || 'A developer making their own little corner of the internet.'}</p>
                {island.location && (
                  <span className="location">
                    <MapPin size={12} />
                    {island.location}
                  </span>
                )}
              </div>
              <div className="profile-stats">
                <div>
                  <strong>{island.projects.length}</strong>
                  <span>projects</span>
                </div>
                <div>
                  <strong>{compact(stars)}</strong>
                  <span>stars</span>
                </div>
                <div>
                  <strong>
                    {island.totalContributions === null ? '—' : compact(island.totalContributions)}
                  </strong>
                  <span>contributions</span>
                </div>
              </div>
              <ExplorerPassport
                island={island}
                visited={visited}
                persistent={persistent}
                palette={palette}
                onSelect={select}
                onNotify={notify}
              />
              <div className="customize">
                <div className="section-label">
                  Make yourself at home <Sparkles size={13} />
                </div>
                <span className="option-label">Island palette</span>
                <div className="palettes">
                  {(Object.keys(PALETTES) as PaletteId[]).map((id) => (
                    <button
                      key={id}
                      title={PALETTES[id].name}
                      aria-label={PALETTES[id].name}
                      aria-pressed={palette === id}
                      onClick={() => appearance({ palette: id })}
                      style={{
                        background: `linear-gradient(135deg,${PALETTES[id].water} 50%,${PALETTES[id].grass} 50%)`,
                      }}
                    >
                      {palette === id && <Check size={14} />}
                    </button>
                  ))}
                  <span>{PALETTES[palette].name}</span>
                </div>
                <span className="option-label">Your explorer</span>
                <div className="avatar-options">
                  {AVATARS.map((a) => (
                    <button
                      key={a.id}
                      aria-label={a.name}
                      aria-pressed={avatar === a.id}
                      title={a.name}
                      onClick={() => appearance({ avatar: a.id })}
                    >
                      <span
                        className="mini-person"
                        style={{ '--shirt': a.color, '--skin': a.skin } as React.CSSProperties}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <button className="share-button" onClick={share}>
                <Share2 size={15} /> Share this island <ArrowUpRight size={15} />
              </button>
              <button className="studio-secondary" onClick={() => setCardOpen(true)}>
                Add island to GitHub
              </button>
              <p className="passport-note">A little world is better with visitors.</p>
            </aside>
          </div>
          {island.notice && <p className="data-notice">{island.notice}</p>}
          <div className="projects-heading">
            <div>
              <span className="eyebrow">BUILT WITH CURIOSITY</span>
              <h2>Every building has a story.</h2>
            </div>
            <span>
              {island.projects.length} places to explore <ChevronRight size={15} />
            </span>
          </div>
          <div className="project-grid">
            {island.projects.map((p, i) => (
              <button key={p.id} className="project-card" onClick={() => select(i)}>
                <div className={'project-symbol symbol-' + i}>
                  <Code2 size={21} />
                </div>
                <div className="project-card-body">
                  <h3>
                    {p.name} <ArrowUpRight size={15} />
                  </h3>
                  <p>{p.description || 'A project waiting to be discovered.'}</p>
                  <div className="project-meta">
                    <span>
                      <i
                        style={{
                          background: [
                            '#678f9b',
                            '#d0ab61',
                            '#88a269',
                            '#ba8b78',
                            '#9f8bae',
                            '#809789',
                          ][i],
                        }}
                      />
                      {p.language || 'Code'}
                    </span>
                    <span>
                      <Star size={12} />
                      {compact(p.stars)}
                    </span>
                    {visited.includes(i) && (
                      <span className="visited-label">
                        <Check size={12} />
                        Visited
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {!island.projects.length && (
            <div className="empty-projects">
              <Leaf />
              <h3>Room for something new.</h3>
              <p>Your island is ready for your first public project.</p>
            </div>
          )}
        </section>
        <section className="bottom-cta">
          <div>
            <span className="eyebrow">THERE’S A PLACE FOR YOU HERE</span>
            <h2>What does your corner of the internet look like?</h2>
          </div>
          <a href="#create">
            Find your island <ArrowRight size={18} />
          </a>
        </section>
      </main>
      <footer>
        <a href="/" className="footer-brand">
          dev island.
        </a>
        <span>Made for the joy of making things.</span>
        <button onClick={() => setAbout(true)}>
          About this little world <ArrowUpRight size={13} />
        </button>
      </footer>
      <dialog
        ref={dialog}
        className="project-dialog"
        onCancel={() => {
          setSelected(null);
          setAbout(false);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelected(null);
            setAbout(false);
          }
        }}
      >
        <button
          className="dialog-close"
          aria-label="Close dialog"
          onClick={() => {
            setSelected(null);
            setAbout(false);
          }}
        >
          <X size={20} />
        </button>
        {about ? (
          <>
            <span className="eyebrow">WELCOME TO DEV ISLAND</span>
            <h2>Your work. Somewhere you can wander.</h2>
            <p>
              Every island starts with public GitHub data. Projects become buildings, and a year of
              contributions becomes a little garden.
            </p>
            <p>
              Choose an explorer and a palette, then share your link. Visitors can walk around or
              simply click the project cards.
            </p>
            <div className="about-note">
              <Layers3 size={22} />
              <span>
                Two visual directions, one world.
                <br />
                Try Pixel island and Miniature 3D to compare the previews.
              </span>
            </div>
            <p className="small-copy">
              The sample island uses a fictional profile and illustrative data. Generated islands
              show public GitHub information and do not imply profile-owner endorsement.
            </p>
          </>
        ) : null}
      </dialog>
      {cardOpen && (
        <ProfileCard
          island={island}
          palette={palette}
          style={style}
          avatar={avatar}
          onClose={() => setCardOpen(false)}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}
    </>
  );
}
