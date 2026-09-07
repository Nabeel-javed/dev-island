'use client';
import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { paintTechnologyScreen, type TechnologyExhibit } from '@/lib/technology-screen';
export default function TechnologyScreen({ exhibit }: { exhibit?: TechnologyExhibit }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const context = canvas.getContext('2d');
    if (context) paintTechnologyScreen(context, exhibit);
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    result.anisotropy = 2;
    return result;
  }, [exhibit]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={[0, 1.75, -0.085]}>
      <planeGeometry args={[1.34, 0.79]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
