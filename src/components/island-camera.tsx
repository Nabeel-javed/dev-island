'use client';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, type ComponentRef, type RefObject } from 'react';
import * as THREE from 'three';
import { fitIslandZoom } from '@/lib/island-camera';
import { trailerFrame } from '@/lib/trailer';
import { PLOTS } from '@/lib/island';
import type { SceneProps } from './pixel-island';
export type CameraCommand = { action: 'reset' | 'in' | 'out' | 'left' | 'right'; sequence: number };
export default function IslandCamera({
  cinematic,
  count,
  entry,
  controller,
  reducedMotion,
  command,
}: {
  cinematic?: RefObject<number>;
  count: number;
  entry: SceneProps['entry'];
  controller: SceneProps['controller'];
  reducedMotion: boolean;
  command: CameraCommand;
}) {
  const { camera, size } = useThree();
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const saved = useRef<{ position: THREE.Vector3; target: THREE.Vector3; zoom: number } | null>(
    null,
  );
  const base = fitIslandZoom(size.width, size.height);
  useEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    camera.position.set(14, 18, 22);
    camera.zoom = base;
    camera.lookAt(0, 0, 1);
    camera.updateProjectionMatrix();
    controls.current?.target.set(0, 0, 1);
    controls.current?.update();
    saved.current = null;
  }, [base, camera]);
  useEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera) || !controls.current) return;
    const c = controls.current;
    if (command.action === 'reset') {
      camera.position.set(14, 18, 22);
      c.target.set(0, 0, 1);
      camera.zoom = base;
    }
    if (command.action === 'in') camera.zoom = Math.min(base * 2.8, camera.zoom * 1.2);
    if (command.action === 'out') camera.zoom = Math.max(base * 0.7, camera.zoom / 1.2);
    if (command.action === 'left' || command.action === 'right') {
      camera.position
        .sub(c.target)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), command.action === 'left' ? 0.3 : -0.3)
        .add(c.target);
    }
    camera.updateProjectionMatrix();
    c.update();
  }, [command, camera, base]);
  useEffect(
    () => () => {
      controller.current.cameraYaw = 0;
    },
    [controller],
  );
  useFrame(() => {
    if (!(camera instanceof THREE.OrthographicCamera) || !controls.current) return;
    const c = controls.current,
      frame = entry?.current;
    c.enabled = !cinematic && !frame;
    if (cinematic || frame) {
      if (!saved.current)
        saved.current = {
          position: camera.position.clone(),
          target: c.target.clone(),
          zoom: camera.zoom,
        };
      if (cinematic) {
        const f = trailerFrame(cinematic.current, count);
        camera.position.set(...f.position);
        c.target.set(...f.target);
        camera.zoom = base * f.zoom;
      } else if (frame) {
        const plot = PLOTS[frame.index],
          focus = frame.focus;
        const target = new THREE.Vector3(plot.x * 0.75, 0.5, 1 + (plot.y - 1) * 0.75);
        c.target.copy(saved.current.target).lerp(target, focus);
        camera.position
          .copy(saved.current.position)
          .addScaledVector(target.sub(saved.current.target), focus);
        camera.zoom = THREE.MathUtils.lerp(saved.current.zoom, base * 1.32, focus);
      }
      camera.lookAt(c.target);
      camera.updateProjectionMatrix();
    } else if (saved.current) {
      camera.position.copy(saved.current.position);
      c.target.copy(saved.current.target);
      camera.zoom = saved.current.zoom;
      camera.updateProjectionMatrix();
      c.update();
      saved.current = null;
    }
    controller.current.cameraYaw = Math.atan2(
      camera.position.x - c.target.x,
      camera.position.z - c.target.z,
    );
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping={!reducedMotion}
      dampingFactor={0.08}
      minPolarAngle={0.35}
      maxPolarAngle={1.25}
      minZoom={base * 0.7}
      maxZoom={base * 2.8}
      zoomSpeed={0.6}
      rotateSpeed={0.55}
    />
  );
}
