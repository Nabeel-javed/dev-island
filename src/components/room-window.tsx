'use client';
import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
export default function RoomWindow({
  night,
  reducedMotion,
}: {
  night: boolean;
  reducedMotion: boolean;
}) {
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uNight: { value: night ? 1 : 0 } }),
    [night],
  );
  useFrame(({ clock }) => {
    uniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime;
  });
  return (
    <group>
      <mesh position={[4.6, 2.15, -4.535]}>
        <planeGeometry args={[1.48, 1.28]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={`varying vec2 vUv;
        void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
          fragmentShader={`
          varying vec2 vUv; uniform float uTime; uniform float uNight;
          void main(){
            vec2 p=vUv;
            vec3 sky=mix(vec3(0.69,0.82,0.76),vec3(0.28,0.59,0.69),p.y);
            sky=mix(sky,mix(vec3(0.1,0.19,0.26),vec3(0.025,0.055,0.14),p.y),uNight);
            float sun=1.0-smoothstep(0.085,0.105,length(p-vec2(0.73,0.76)));
            sky=mix(sky,mix(vec3(1.0,0.87,0.59),vec3(0.77,0.85,0.94),uNight),sun);
            float clouds=sin(p.x*9.0+uTime*0.07)+sin(p.x*17.0-uTime*0.035)*0.35;
            float cloud=smoothstep(0.02,0.07,0.07-abs(p.y-0.61-clouds*0.025));
            sky=mix(sky,vec3(0.91,0.93,0.86),cloud*0.35*(1.0-uNight));
            float ridge=0.21+sin(p.x*8.0)*0.06+sin(p.x*17.0)*0.02;
            sky=mix(sky,mix(vec3(0.31,0.48,0.36),vec3(0.045,0.11,0.12),uNight),1.0-smoothstep(ridge,ridge+0.008,p.y));
            gl_FragColor=vec4(sky,1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`}
        />
      </mesh>
      <mesh position={[3.7, 0.312, -2.7]} rotation={[-Math.PI / 2, 0, -0.28]}>
        <planeGeometry args={[2.3, 3.5]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          uniforms={uniforms}
          vertexShader={`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
          fragmentShader={`varying vec2 vUv; uniform float uNight;
          void main(){vec2 edge=min(vUv,1.0-vUv); float mask=smoothstep(0.0,0.08,min(edge.x,edge.y));
            mask*=smoothstep(0.012,0.026,abs(vUv.x-0.5))*smoothstep(0.012,0.026,abs(vUv.y-0.5));
            gl_FragColor=vec4(mix(vec3(1.0,0.87,0.58),vec3(0.6,0.75,1.0),uNight),mask*mix(0.18,0.045,uNight));
            #include <colorspace_fragment>
          }`}
        />
      </mesh>
    </group>
  );
}
