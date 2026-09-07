'use client';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { doorwayPath, pathLength, pointOnPath, type DoorwayFrame } from '@/lib/doorway';
import type { Controller } from './use-controller';
export function useEntrance(
  controller: RefObject<Controller>,
  frame: RefObject<DoorwayFrame | null>,
  count: number,
  reducedMotion: boolean,
  ready: boolean,
  onOpen: (index: number, replace?: boolean) => void,
) {
  const [index, setIndex] = useState<number | null>(null);
  const run = useRef<{ index: number; replace: boolean; raf: number } | null>(null);
  const stop = useCallback(() => {
    if (run.current) cancelAnimationFrame(run.current.raf);
    run.current = null;
    frame.current = null;
    controller.current.scripted = false;
    controller.current.moving = false;
    controller.current.keys.clear();
  }, [controller, frame]);
  const cancel = useCallback(() => {
    stop();
    setIndex(null);
  }, [stop]);
  const skip = useCallback(() => {
    const current = run.current;
    if (!current) return;
    stop();
    setIndex(null);
    onOpen(current.index, current.replace);
  }, [stop, onOpen]);
  const enter = useCallback(
    (target: number, replace = false) => {
      if (run.current || target < 0 || target >= count) return;
      if (reducedMotion || !ready) {
        onOpen(target, replace);
        return;
      }
      const path = doorwayPath(controller.current, target, count);
      if (!path) {
        onOpen(target, replace);
        return;
      }
      const current = { index: target, replace, raf: 0 };
      run.current = current;
      frame.current = { index: target, focus: 0, door: 0 };
      controller.current.keys.clear();
      controller.current.scripted = true;
      setIndex(target);
      const began = performance.now(),
        walkSeconds = pathLength(path) / 7;
      const tick = (now: number) => {
        if (run.current !== current) return;
        const seconds = (now - began) / 1000,
          c = controller.current,
          p = pointOnPath(path, seconds * 7);
        c.dx = p.x - c.x;
        c.dy = p.y - c.y;
        c.moving = Math.hypot(c.dx, c.dy) > 0.001;
        c.x = p.x;
        c.y = p.y;
        const t = Math.min(1, seconds / 0.65);
        frame.current = {
          index: target,
          focus: t * t * (3 - 2 * t),
          door: Math.max(0, Math.min(1, (seconds - walkSeconds) / 0.45)),
        };
        if (seconds >= walkSeconds + 0.65) {
          stop();
          setIndex(null);
          onOpen(target, replace);
        } else current.raf = requestAnimationFrame(tick);
      };
      current.raf = requestAnimationFrame(tick);
    },
    [controller, frame, count, reducedMotion, ready, onOpen, stop],
  );
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && run.current) {
        event.preventDefault();
        cancel();
      }
    };
    const hidden = () => {
      if (document.hidden && run.current) cancel();
    };
    window.addEventListener('keydown', escape);
    window.addEventListener('popstate', cancel);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      stop();
      window.removeEventListener('keydown', escape);
      window.removeEventListener('popstate', cancel);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, [cancel, stop]);
  useEffect(() => {
    if (reducedMotion && run.current) skip();
  }, [reducedMotion, skip]);
  return { index, enter, skip, cancel };
}
