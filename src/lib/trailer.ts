import { PLOTS } from './island';
export const TRAILER_SECONDS = 12;
export function trailerFrame(seconds: number, count: number) {
  const t = Math.max(0, Math.min(TRAILER_SECONDS, Number.isFinite(seconds) ? seconds : 0));
  const n = Math.max(0, Math.min(3, Math.floor(count)));
  const segment = n ? 7.5 / n : 7.5;
  const project = n && t >= 2 && t < 9.5 ? Math.min(n - 1, Math.floor((t - 2) / segment)) : -1;
  const local = project < 0 ? 0 : (t - 2 - project * segment) / segment;
  const weight = project < 0 ? 0 : Math.sin(Math.PI * local) ** 2;
  const plot = PLOTS[Math.max(0, project)];
  const angle = 0.48 + t * 0.045;
  return {
    project,
    target: [plot.x * weight * 0.65, 0, plot.y * weight * 0.65] as [number, number, number],
    position: [Math.sin(angle) * 26, 18 - weight * 2, Math.cos(angle) * 26] as [
      number,
      number,
      number,
    ],
    zoom: 1 + weight * 0.35,
    ending: t >= 9.5,
  };
}
export function recordingType(supported: (mime: string) => boolean) {
  return (
    ['video/mp4;codecs=avc1.424028', 'video/mp4', 'video/webm;codecs=vp8', 'video/webm'].find(
      supported,
    ) ?? null
  );
}
