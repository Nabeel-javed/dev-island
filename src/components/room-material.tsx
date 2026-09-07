'use client';
import { useCallback } from 'react';
import type * as THREE from 'three';
export type Finish = 'wood' | 'plaster' | 'fabric';
/** World-space grain stays consistent across differently sized furniture pieces. */
export default function RoomMaterial({ color, finish }: { color: string; finish: Finish }) {
  const compile = useCallback(
    (shader: Parameters<THREE.MeshStandardMaterial['onBeforeCompile']>[0]) => {
      shader.vertexShader = 'varying vec3 vGrain;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvGrain = (modelMatrix * vec4(position, 1.0)).xyz;',
      );
      shader.fragmentShader = 'varying vec3 vGrain;\n' + shader.fragmentShader;
      const pattern =
        finish === 'wood'
          ? 'sin(vGrain.x * 85.0 + sin(vGrain.z * 3.0) * 2.0 + sin(vGrain.z * 8.0) * 0.5) * 0.035 + sin(vGrain.z * 0.7 + vGrain.x * 9.0) * 0.025'
          : finish === 'fabric'
            ? 'sin(vGrain.x * 160.0) * sin(vGrain.z * 160.0) * 0.045'
            : 'sin(vGrain.x * 121.0 + vGrain.y * 83.0) * sin(vGrain.y * 97.0 + vGrain.z * 137.0) * 0.018';
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>\ndiffuseColor.rgb *= 0.97 + ${pattern};`,
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
