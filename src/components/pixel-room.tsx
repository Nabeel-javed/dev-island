'use client';
import { useEffect, useRef } from 'react';
import { ROOM_EXIT, STATIONS } from '@/lib/room';
import { paintPixelRoom, roomPoint as point } from '@/lib/pixel-room-art';
import type { RoomSceneProps } from './room-scene-types';
export default function PixelRoom(props: RoomSceneProps) {
  const canvas = useRef<HTMLCanvasElement>(null),
    latest = useRef(props);
  latest.current = props;
  useEffect(() => {
    const c = canvas.current?.getContext('2d');
    if (!c) return;
    let frame = 0,
      previous = 0;
    function draw(time: number) {
      const p = latest.current;
      p.controller.current.step(previous ? (time - previous) / 1000 : 0);
      previous = time;
      paintPixelRoom(c!, { ...p, player: p.controller.current }, time);
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
      aria-label="Pixel project room. Walk to furniture and use the interact button, or click a station."
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
