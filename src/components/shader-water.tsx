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
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      float heightAt(vec2 p) {
        float t=uTime*0.35;
        return sin(dot(p,vec2(0.68,0.22))+t)*0.11
          +sin(dot(p,vec2(-0.32,0.91))-t*0.8)*0.055
          +sin(dot(p,vec2(1.42,0.77))+t*1.3)*0.018;
      }
      void main() {
        vec2 p = vSurface;
        float shore = length(p / vec2(1.0, 0.72));
        float h=heightAt(p);
        vec3 normal=normalize(vec3((h-heightAt(p+vec2(0.08,0)))/0.08,1.0,(h-heightAt(p+vec2(0,0.08)))/0.08));
        float swell=noise(p*0.19+vec2(uTime*0.008,-uTime*0.006));
        float shallow=1.0-smoothstep(10.4,17.0,shore);
        vec3 deep=uColor*mix(0.77,0.85,uNight);
        vec3 turquoise=mix(uColor,vec3(0.18,0.53,0.48),0.24*(1.0-uNight));
        vec3 base=mix(deep,turquoise,shallow*0.65+swell*0.14);
        // Broad, low-contrast sky light follows the wave slope; no repeated bright dots.
        float sheen=pow(max(0.0,dot(normal,normalize(vec3(-0.4,1.0,0.5)))),12.0);
        base=mix(base,uColor*1.08,sheen*0.19);
        float ripple=sin(p.x*2.1+p.y*0.45+noise(p*0.8)*3.0+uTime*0.45);
        base+=uColor*ripple*0.014;
        // A broken wash hugs the beach, instead of concentric expanding rings.
        float coastalNoise=noise(p*1.7+vec2(uTime*0.045,0));
        float edge=10.55+coastalNoise*0.48+sin(uTime*0.55)*0.1;
        float wash=1.0-smoothstep(0.035,0.28,abs(shore-edge));
        float breakup=smoothstep(0.34,0.68,noise(p*0.72+uTime*0.018));
        base=mix(base,mix(vec3(0.72,0.84,0.76),uColor*1.45,uNight),wash*breakup*mix(0.28,0.15,uNight));
        base = mix(base, uColor, smoothstep(30.0, 75.0, length(p)));
        gl_FragColor = vec4(base, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `}
      />
    </mesh>
  );
}
