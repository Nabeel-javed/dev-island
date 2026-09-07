# Dev Island: a more convincing world

Research and implementation brief · 7 September 2026 · For Nabeel and future maintainers

## Decision

Keep the existing WebGL/React Three Fiber renderer and its miniature art direction. Improve light, surface response, landscape density and camera freedom together. Add practical exploration tools. Photorealism would also require a different asset set and art-production process; adding expensive effects alone cannot deliver it.

Scope: the 3D island and interiors, with pixel mode retained. Existing Next 16.3.4, Three 0.185.1, R3F 9.7.0 and Drei 10.7.8 were inspected locally. No purchased assets, external AI service, new credentials or runtime CDN assets are needed. Performance targets are design budgets, not measured promises for every device.

## Evidence and choices

| Decision                                                   | Evidence and tradeoff                                                                                                                                                                                                                                                | Confidence                                           |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Add a static environment; reduce flat ambient fill         | Three's standard material uses metallic–roughness PBR and recommends an environment map. A static procedural environment can supply broad sky and warm ground response without an HDR download.                                                                      | High for mechanism; appearance needs visual QA       |
| Unify water displacement and normals; add Fresnel response | Local shader inspection found different wave equations in the two stages. The replacement should use shared analytic waves and their derivatives. Fresnel sky reflection is an approximation, not a reflection of actual buildings.                                  | High for mismatch; visual tuning required            |
| Keep planar reflections as future measured work            | Three's Water addon supports WebGL, but the installed implementation renders the scene through a mirror camera into another render target. This increases rendering work and does not automatically solve shallow-water colour or shoreline foam.                    | High from installed source                           |
| Batch landscape detail                                     | R3F recommends instancing repeated objects; MDN recommends batching draw calls and controlling back-buffer size. Use shared grass/rock meshes with a bounded count rather than many separate React meshes.                                                           | High                                                 |
| Automatic quality with manual override                     | R3F's performance guidance describes adaptive resolution and a fallback after repeated oscillation. High detail can cost more on high-DPI displays. Offer Automatic, High detail and Battery saver; do not claim a universal frame rate.                             | High for mechanism                                   |
| Make exploration easier                                    | The existing camera is fixed except entrance/trailer animation. A rotatable, zoomable view and searchable project directory let visitors inspect detail and reach a relevant repository. This is a product inference from the app, not a published engagement claim. | Medium; usability check required                     |
| Keep motion optional                                       | W3C describes reduced-motion preferences and controls for ongoing animation. Add an explicit ambient-motion preference and continue respecting the OS setting.                                                                                                       | High for guidance; no blanket WCAG conformance claim |

## Implementation sequence

1. Graphics settings and shared lighting environment.
2. Coherent water shading, surface finishes, and instanced landscape.
3. Island camera controls and a larger exploration view.
4. Searchable project finder with language and unvisited filters.
5. Render/browser verification, regression checks, individual commits and production deployment.

## Alternatives and remaining gaps

A WebGPU migration changes the renderer and shader implementation without fixing composition or assets, so it is deferred. Full-screen bloom, depth of field and transmission can obscure labels or consume fill rate; they are not defaults. A planar reflection tier can be revisited after profiling this release. The current scope does not add authored photogrammetry, scanned PBR textures, multiplayer or an AI chatbot. Those are separate production decisions.

## Source ledger

Sources accessed 7 September 2026; most reference pages do not state a publication date. These links support the rendering and accessibility mechanisms, not a measured improvement in this app.

- [MeshStandardMaterial — Three.js](https://threejs.org/docs/pages/MeshStandardMaterial.html): PBR, environment maps, metallic–roughness properties. Primary documentation, opened and checked against installed version.
- [Color Management — Three.js](https://threejs.org/manual/en/color-management.html): colour textures versus non-colour data; custom shader output conversion. Preserve R3F's existing ACES/sRGB defaults instead of applying conversion twice.
- [Water — Three.js](https://threejs.org/docs/pages/Water.html): reflective flat-water WebGL addon; extra render verified in installed `examples/jsm/objects/Water.js`.
- [Environment — Drei](https://github.com/pmndrs/drei/blob/master/docs/staging/environment.mdx): environment independent of background, one-frame capture and intensity. Cross-checked installed types/source.
- [Scaling performance — R3F](https://r3f.docs.pmnd.rs/advanced/scaling-performance): instancing and adaptive resolution. Search evidence available; full-page fetch exceeded the retrieval limit. Installed PerformanceMonitor API inspected.
- [WebGL best practices — MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices): batching draw calls, smaller back buffers, resource disposal and varying device capabilities.
- [Reduced motion technique C39 — W3C](https://www.w3.org/WAI/WCAG21/Techniques/css/C39.html): revised 12 January 2026; respect user motion preferences.
- [Pause, Stop, Hide — W3C](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html): provide control over ongoing nonessential animation.

## Research boundary

Two focused passes covered rendering and performance/accessibility, with one independent rendering research lane and local implementation checks. Consequential recommendations have primary support or are explicitly marked as product/design inference. Research stopped when further searches were unlikely to change the implementation choice. The plan tool was unavailable in this environment; this brief records the sequence instead. Real-device mobile performance remains a separate validation gap.
