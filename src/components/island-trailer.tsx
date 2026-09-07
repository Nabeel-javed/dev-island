'use client';
import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Download, Play, Square, Video, X } from 'lucide-react';
import { PALETTES, type Island, type PaletteId, type AvatarId } from '@/lib/island';
import { recordingType, trailerFrame, TRAILER_SECONDS } from '@/lib/trailer';
import { useController } from './use-controller';
const Three = dynamic(() => import('./three-island'), { ssr: false });
class TrailerBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p className="scene-fallback">
        The trailer’s 3D graphics couldn’t load. Close this preview and try again.
      </p>
    ) : (
      this.props.children
    );
  }
}
export default function IslandTrailer({
  island,
  palette,
  avatar,
  onClose,
}: {
  island: Island;
  palette: PaletteId;
  avatar: AvatarId;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    scene = useRef<HTMLDivElement>(null);
  const time = useRef(0),
    frameId = useRef(0),
    outputURL = useRef('');
  const run = useRef<{ recorder?: MediaRecorder; stream?: MediaStream; valid: boolean } | null>(
    null,
  );
  const [ready, setReady] = useState(false),
    [elapsed, setElapsed] = useState(0);
  const [active, setActive] = useState(false),
    [message, setMessage] = useState('');
  const [format, setFormat] = useState<string | null>(null);
  const [output, setOutput] = useState<{ url: string; extension: string } | null>(null);
  const controller = useController(0, () => {}, true);
  const onReady = useCallback(() => setReady(true), []);
  const stop = useCallback(() => {
    cancelAnimationFrame(frameId.current);
    const current = run.current;
    if (current) {
      current.valid = false;
      if (current.recorder && current.recorder.state !== 'inactive') current.recorder.stop();
      current.stream?.getTracks().forEach((track) => track.stop());
    }
    run.current = null;
  }, []);
  useEffect(() => {
    dialog.current?.showModal();
    if (
      typeof MediaRecorder !== 'undefined' &&
      typeof HTMLCanvasElement.prototype.captureStream === 'function'
    )
      setFormat(recordingType((type) => MediaRecorder.isTypeSupported(type)));
    const hidden = () => {
      if (document.hidden && run.current) {
        stop();
        setActive(false);
        setMessage('Preview stopped while the tab was hidden. Keep this tab open and try again.');
      }
    };
    document.addEventListener('visibilitychange', hidden);
    return () => {
      stop();
      URL.revokeObjectURL(outputURL.current);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, [stop]);
  function start(record: boolean) {
    stop();
    const source = scene.current?.querySelector('canvas');
    if (!source || !source.width) {
      setMessage('3D graphics are unavailable. Try again once the island has loaded.');
      return;
    }
    URL.revokeObjectURL(outputURL.current);
    outputURL.current = '';
    setOutput(null);
    setMessage(
      record
        ? 'Recording your island. Keep this tab open for 12 seconds.'
        : 'Playing your island trailer.',
    );
    setActive(true);
    time.current = 0;
    setElapsed(0);
    const current: NonNullable<typeof run.current> = { valid: true };
    run.current = current;
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const c = canvas.getContext('2d');
    if (!c) {
      stop();
      setActive(false);
      setMessage('Video drawing is unavailable in this browser.');
      return;
    }
    const fit = (text: string, width: number) => {
      let result = text;
      while (result.length && c.measureText(result).width > width) result = result.slice(0, -1);
      return result === text ? text : result.slice(0, -1) + '…';
    };
    const draw = () => {
      const shot = trailerFrame(time.current, island.projects.length);
      c.fillStyle = PALETTES[palette].water;
      c.fillRect(0, 0, 1280, 720);
      const scale = Math.min(1280 / source.width, 720 / source.height);
      c.drawImage(
        source,
        (1280 - source.width * scale) / 2,
        (720 - source.height * scale) / 2,
        source.width * scale,
        source.height * scale,
      );
      c.fillStyle = '#f8f7f1';
      c.fillRect(0, 0, 1280, 90);
      c.fillRect(0, 590, 1280, 130);
      c.fillStyle = PALETTES[palette].accent;
      c.font = 'bold 32px sans-serif';
      c.fillText(fit(`${island.name}’s island`, 960), 40, 56);
      c.font = '18px sans-serif';
      c.fillText('dev island.', 1125, 54);
      c.font = 'bold 28px sans-serif';
      const project = island.projects[shot.project];
      c.fillText(
        fit(
          shot.ending
            ? 'Your code could be a world of its own.'
            : project
              ? project.name
              : 'Your GitHub. Somewhere you can wander.',
          1190,
        ),
        40,
        636,
      );
      c.font = '19px sans-serif';
      c.fillStyle = '#657b64';
      c.fillText(
        fit(
          shot.ending
            ? `${window.location.host}${island.source === 'demo' ? ' · Sample island' : `/u/${island.login}`}`
            : project
              ? project.description || 'Step inside to explore the code.'
              : `${island.projects.length} project rooms. A little world of discoveries.`,
          1190,
        ),
        40,
        678,
      );
    };
    try {
      draw();
      if (record) {
        if (!format)
          throw new Error('Video export is unavailable. You can still preview the trailer.');
        const stream = canvas.captureStream(30);
        current.stream = stream;
        const recorder = new MediaRecorder(stream, {
          mimeType: format,
          videoBitsPerSecond: 5_000_000,
        });
        current.recorder = recorder;
        const chunks: Blob[] = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size) chunks.push(event.data);
        };
        recorder.onerror = () => {
          stop();
          setActive(false);
          setMessage('Recording failed. Try a shorter browser session or another browser.');
        };
        recorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
          if (!current.valid) return;
          const blob = new Blob(chunks, { type: recorder.mimeType });
          if (!blob.size) {
            setMessage('The recording was empty. Please try again.');
            return;
          }
          const url = URL.createObjectURL(blob);
          outputURL.current = url;
          setOutput({ url, extension: recorder.mimeType.includes('mp4') ? 'mp4' : 'webm' });
          setMessage('Your trailer is ready. Preview it below, then download.');
          run.current = null;
        };
        recorder.start(250);
      }
      const began = performance.now();
      const tick = (now: number) => {
        if (!current.valid) return;
        try {
          time.current = Math.min((now - began) / 1000, TRAILER_SECONDS);
          setElapsed(Math.floor(time.current * 10) / 10);
          draw();
          if (time.current < TRAILER_SECONDS) frameId.current = requestAnimationFrame(tick);
          else {
            setActive(false);
            if (current.recorder?.state === 'recording') current.recorder.stop();
            else {
              setMessage('Preview finished. Record a video to download it.');
              run.current = null;
            }
            // Keep the run until onstop completes so closing can invalidate it.
          }
        } catch {
          stop();
          setActive(false);
          setMessage('Video rendering failed. Please try again.');
        }
      };
      frameId.current = requestAnimationFrame(tick);
    } catch (error) {
      stop();
      setActive(false);
      setMessage(error instanceof Error ? error.message : 'Video export failed.');
    }
  }
  const shot = trailerFrame(elapsed, island.projects.length),
    project = island.projects[shot.project];
  return (
    <dialog
      className="project-dialog studio-dialog trailer-dialog"
      ref={dialog}
      aria-labelledby="trailer-title"
      onCancel={onClose}
    >
      <button className="dialog-close" aria-label="Close island trailer" onClick={onClose}>
        <X size={20} />
      </button>
      <span className="eyebrow">YOUR WORLD, IN TWELVE SECONDS</span>
      <h2 id="trailer-title">Make an island trailer.</h2>
      <p>A 3D flyover with highlights from up to three projects. Press play when you’re ready.</p>
      <div className="trailer-stage">
        <div className="trailer-caption">
          <strong>{island.name}’s island</strong>
          <span>dev island.</span>
        </div>
        <div className="trailer-scene" ref={scene} inert>
          <TrailerBoundary>
            <Three
              island={island}
              palette={palette}
              avatar={avatar}
              reducedMotion={true}
              controller={controller}
              onSelect={() => {}}
              onReady={onReady}
              cinematic={time}
            />
          </TrailerBoundary>
        </div>
        <div className="trailer-caption trailer-caption-bottom">
          <strong>
            {shot.ending
              ? 'Your code could be a world of its own.'
              : project?.name || 'Your GitHub. Somewhere you can wander.'}
          </strong>
          <small>
            {shot.ending
              ? 'Explore it. Then make yours.'
              : project?.description ||
                `${island.projects.length} project rooms. A little world of discoveries.`}
          </small>
        </div>
      </div>
      <progress max={TRAILER_SECONDS} value={elapsed} aria-label="Trailer progress" />
      <div className="studio-actions">
        <button
          className="studio-secondary"
          disabled={!ready || active}
          onClick={() => start(false)}
        >
          <Play size={15} /> Preview
        </button>
        <button
          className="studio-primary"
          disabled={!ready || active || !format}
          onClick={() => start(true)}
        >
          <Video size={15} /> Record {format?.includes('mp4') ? 'MP4' : 'video'}
        </button>
        {active && (
          <button
            className="studio-secondary"
            onClick={() => {
              stop();
              setActive(false);
              setMessage('Trailer stopped.');
            }}
          >
            <Square size={14} /> Stop
          </button>
        )}
      </div>
      <p className="studio-note">
        Silent · 12 seconds · 1280 × 720.{' '}
        {format
          ? `Export: ${format.includes('mp4') ? 'MP4' : 'WebM (convert to MP4 if your social platform requires it)'}.`
          : 'Video export is unavailable in this browser; preview is still available.'}
      </p>
      <p role="status">{message}</p>
      {output && (
        <div className="trailer-output">
          <video src={output.url} controls playsInline aria-label="Recorded island trailer" />
          <a
            className="studio-primary"
            download={`dev-island-${island.login}-trailer.${output.extension}`}
            href={output.url}
          >
            <Download size={15} /> Download {output.extension.toUpperCase()}
          </a>
        </div>
      )}
    </dialog>
  );
}
