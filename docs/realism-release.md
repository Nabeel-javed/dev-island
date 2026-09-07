# Dev Island realism and exploration update

8 September 2026. [Research and tradeoffs](realism-research.md).

## Shipped changes

- Static procedural environment lighting for the island and rooms, with automatic graphics adjustment and persistent High detail / Battery saver overrides.
- Shared water equations for displacement and normals; camera-dependent sky reflections, shallow-water detail and broken shore wash. Reflections approximate the sky; buildings are not rendered into a planar reflection texture.
- Textured sand, grass and building surfaces; denser wind-driven planting and coastal stones, batched into two instanced meshes. Rounded tree crowns and a small bevel on pitched roofs add silhouette detail.
- Drag-to-orbit island camera, zoom and reset controls, a full-window exploration view, and walking directions that follow the camera angle. Entrance and trailer cameras retain control while active.
- Project finder with text, language and unvisited filters, preserving original plot indices. Results open the selected room through the existing entrance flow.
- Repository-specific technology monitor with language percentages calculated from source bytes. Sample data, loading and unavailable states are explicit.
- Still-scenery control, combined with the operating system's reduced-motion preference. Movement remains available.

## Verification

- All 64 tests passed, including graphics preference bounds, camera movement, landscape placement, combined project filtering and monitor data states.
- TypeScript, formatting and production build passed. Production build and formatting were repeated after the final small-screen CSS adjustment.
- Chrome Guest, compiled local production preview: day island rendered, expanded view worked, rotation changed the viewpoint, searching `moss` reduced six results to one, and the entry skip control opened `demo/moss-ui`. The room and its language monitor rendered. The demo API returned 85% TypeScript and 15% CSS by source bytes.
- Pixel day/night rendering regression tests passed and static previews were regenerated.

## Verification limits

The in-app browser failed to initialize; Brave control was repeatedly interrupted. A separate Chrome Guest session allowed the desktop checks above, then became unavailable. This pass did not complete phone viewport, new 3D night-mode, manual quality-toggle, full automatic entrance timing, or frame-rate measurements. Screenshot inspection does not establish a clean WebGL console. The final small-screen CSS change passed compilation and formatting but was not visually checked on a phone.

No universal frame-rate or photorealism claim is made. The app retains a stylized miniature art direction, procedural assets and the existing WebGL renderer. Existing unrelated `.gitignore` edits were preserved and excluded from commits.
