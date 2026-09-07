'use client';
import { useCallback } from 'react';
import type * as THREE from 'three';
export type Finish = 'wood' | 'plaster' | 'fabric' | 'stone' | 'sand' | 'grass';
/** World-space grain stays consistent across differently sized furniture pieces. */
export default function RoomMaterial({ color, finish }: { color: string; finish: Finish }) {
  const compile = useCallback(
    (shader: Parameters<THREE.MeshStandardMaterial['onBeforeCompile']>[0]) => {
      shader.vertexShader = 'varying vec3 vGrain;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvGrain = (modelMatrix * vec4(position, 1.0)).xyz;',
      );
      shader.fragmentShader =
        `varying vec3 vGrain;
float materialHash(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
float materialNoise(vec3 p) {
  vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(materialHash(i),materialHash(i+vec3(1,0,0)),f.x),mix(materialHash(i+vec3(0,1,0)),materialHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(materialHash(i+vec3(0,0,1)),materialHash(i+vec3(1,0,1)),f.x),mix(materialHash(i+vec3(0,1,1)),materialHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
` + shader.fragmentShader;
      const pattern =
        finish === 'grass'
          ? '(materialNoise(vGrain * 1.8) - 0.5) * 0.18 + (materialNoise(vGrain * 35.0) - 0.5) * 0.08'
          : finish === 'sand' || finish === 'stone'
            ? '(materialNoise(vGrain * 3.0) - 0.5) * 0.14 + (materialNoise(vGrain * 48.0) - 0.5) * 0.055'
            : finish === 'wood'
              ? 'sin(vGrain.x * 85.0 + sin(vGrain.z * 3.0) * 2.0 + sin(vGrain.z * 8.0) * 0.5) * 0.018 + sin(vGrain.z * 0.7 + vGrain.x * 9.0) * 0.015'
              : finish === 'fabric'
                ? 'sin(vGrain.x * 160.0) * sin(vGrain.z * 160.0) * 0.045'
                : 'sin(vGrain.x * 121.0 + vGrain.y * 83.0) * sin(vGrain.y * 97.0 + vGrain.z * 137.0) * 0.018';
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>\nfloat grainDetail = ${pattern};\ndiffuseColor.rgb *= 0.98 + grainDetail * (1.0 - smoothstep(0.015, 0.09, length(fwidth(vGrain))));`,
      );
    },
    [finish],
  );
  return (
    <meshStandardMaterial
      color={color}
      roughness={finish === 'wood' ? 0.62 : 0.94}
      onBeforeCompile={compile}
      customProgramCacheKey={() => 'room-grain-' + finish}
    />
  );
}
