'use client';
import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGraphics, GRAPHICS } from './graphics-settings';
// Height and analytic slope are shared by both stages. The near shore stays calm.
const waves = `
  uniform float uTime;
  vec3 wave(vec2 p, vec2 direction, float frequency, float amplitude, float speed) {
    float phase=dot(p,direction)*frequency+uTime*speed;
    return vec3(sin(phase)*amplitude, cos(phase)*amplitude*frequency*direction);
  }
  vec3 ocean(vec2 p) {
    return wave(p,normalize(vec2(1.0,0.3)),0.72,0.065,0.6)
      +wave(p,normalize(vec2(-0.4,1.0)),1.25,0.032,-0.48)
      +wave(p,normalize(vec2(0.6,1.0)),2.4,0.009,0.8);
  }
`;
export default function ShaderWater({
  color,
  night,
  reducedMotion,
}: {
  color: string;
  night: boolean;
  reducedMotion: boolean;
}) {
  const { level } = useGraphics();
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
      <planeGeometry
        args={[120, 120, GRAPHICS[level].waterSegments, GRAPHICS[level].waterSegments]}
      />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
        ${waves}
        varying vec3 vWorld;
        void main() {
          vec3 p=position;
          vec3 world=(modelMatrix*vec4(p,1.0)).xyz;
          p.z+=ocean(world.xz).x;
          vWorld=(modelMatrix*vec4(p,1.0)).xyz;
          gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.0);
        }
      `}
        fragmentShader={`
        ${waves}
        uniform vec3 uColor;
        uniform float uNight;
        varying vec3 vWorld;
        float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float noise(vec2 p) {
          vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
        }
        void main() {
          vec2 p=vWorld.xz;
          vec3 swell=ocean(p);
          vec3 normal=normalize(vec3(-swell.y,1.0,-swell.z));
          vec3 viewDir=normalize(cameraPosition-vWorld);
          // Sky reflection approximation, not a second scene render.
          float fresnel=0.025+0.975*pow(1.0-max(dot(normal,viewDir),0.0),5.0);
          vec3 reflected=reflect(-viewDir,normal);
          vec3 sky=mix(vec3(0.40,0.60,0.66),vec3(0.15,0.34,0.49),smoothstep(0.0,0.8,reflected.y));
          sky=mix(sky,vec3(0.045,0.09,0.16),uNight);
          float shore=length(p/vec2(1.0,0.72));
          float shallow=1.0-smoothstep(10.1,17.0,shore);
          vec3 deep=mix(uColor*0.59,vec3(0.015,0.07,0.09),uNight*0.45);
          vec3 lagoon=mix(uColor*0.88,vec3(0.075,0.34,0.28),0.32*(1.0-uNight));
          vec3 base=mix(deep,lagoon,shallow);
          float current=noise(p*0.21+uTime*0.009);
          base*=0.92+current*0.13;
          base=mix(base,sky,0.18+fresnel*0.62);
          vec3 sun=normalize(vec3(-9.0,18.0,10.0));
          float spec=pow(max(dot(normal,normalize(sun+viewDir)),0.0),160.0);
          base+=mix(vec3(0.6,0.48,0.29),vec3(0.11,0.15,0.2),uNight)*spec*0.2;
          // Distorted caustic ribbons are visible only in the shallows.
          float caustic=sin(p.x*3.1+sin(p.y*2.0+uTime*0.3))+sin(p.y*3.3+sin(p.x*2.3-uTime*0.25));
          base+=vec3(0.05,0.09,0.055)*pow(max(0.0,caustic*0.5),8.0)*shallow*(1.0-uNight)*0.4;
          float edge=10.35+noise(p*1.3)*0.35+sin(uTime*0.5)*0.09;
          float foam=(1.0-smoothstep(0.035,0.22,abs(shore-edge)))*smoothstep(0.35,0.7,noise(p*0.9+uTime*0.025));
          base=mix(base,mix(vec3(0.52,0.68,0.58),uColor*1.1,uNight),foam*0.4);
          base=mix(base,uColor,smoothstep(26.0,58.0,length(p)));
          gl_FragColor=vec4(base,1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `}
      />
    </mesh>
  );
}
