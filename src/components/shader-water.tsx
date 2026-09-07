'use client';
import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ShaderWater({
  color,
  night,
  reducedMotion,
}: {
  color: string;
  night: boolean;
  reducedMotion: boolean;
}) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uNight: { value: night ? 1 : 0 },
    }),
    [color, night],
  );
  useFrame(({ clock }) => {
    uniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]}>
      <planeGeometry args={[200, 200, 128, 128]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
      uniform float uTime;
      varying vec2 vSurface;
      void main() {
        vSurface = position.xy;
        vec3 p = position;
        p.z += sin(p.x * 0.8 + uTime * 0.7) * cos(p.y * 0.65 - uTime * 0.5) * 0.035;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `}
        fragmentShader={`
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uNight;
      varying vec2 vSurface;
      void main() {
        vec2 p = vSurface;
        float shore = length(p / vec2(1.0, 0.72));
        float wave = sin(p.x * 1.4 + p.y * 0.9 + uTime * 0.7)
                   + sin(p.x * 0.7 - p.y * 1.8 - uTime * 0.55);
        float shallow = 1.0 - smoothstep(10.0, 15.0, shore);
        vec3 base = mix(uColor * 0.74, uColor * 1.12, 0.5 + wave * 0.1);
        base = mix(base, uColor * 1.25, shallow * 0.32);
        float band = sin(shore * 6.0 - uTime * 1.2 + sin(atan(p.y, p.x) * 9.0) * 0.35);
        float foam = smoothstep(0.82, 0.98, band) * smoothstep(10.1, 10.8, shore) * (1.0 - smoothstep(11.1, 13.0, shore));
        float glint = pow(max(0.0, wave * 0.5), 14.0) * 0.22;
        base += vec3(0.7, 0.86, 0.8) * (foam * 0.45 + glint) * mix(1.0, 0.35, uNight);
        base = mix(base, uColor, smoothstep(28.0, 65.0, length(p)));
        gl_FragColor = vec4(base, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `}
      />
    </mesh>
  );
}
