# Preview validation — 7 September 2026

## Automated checks

- TypeScript compilation and optimized Next.js production build.
- Node tests: pinned-first selection, deduplication, private/fork/archive filtering, empty accounts, deterministic seed, safe preset parsing, username and external-link validation, island bounds, collision, normalized movement, concurrent cache requests, stale fallback and deletion handling.
- Local HTTP checks: sample profile returns six projects; `octocat` returns live public repositories with unavailable contribution data in no-token mode; invalid username returns HTTP 400; the social-card endpoint returns a valid PNG.

## Browser checks performed

Using Brave on macOS with visible UI:

- Pixel and 3D scenes rendered successfully at desktop width.
- Both scenes rendered in the browser's 390-pixel responsive viewport, with directional controls visible.
- Repeated directional-button taps moved the explorer into project range; pressing E opened soundscape. Switching to 3D preserved that position and E opened the same project.
- Project card click opened its dialog, Escape dismissed it, focus returned and the visited count changed.
- Palette and avatar choices updated the view and URL; a reload restored those choices.
- Share produced a successful clipboard confirmation.
- PNG postcard export reached the browser's save dialog. A completed disk save was not verified because the native Save control remained disabled during automation.
- Social-card PNG was saved independently through its HTTP endpoint and visually inspected.

## Remaining verification before public launch

- Authenticated GraphQL and Upstash Redis paths require dedicated credentials and were not exercised live.
- Real mobile hardware, Safari, touch-drag holding behavior and browser graphics fallback need additional coverage. Responsive desktop emulation is not a device performance measurement.
- The development browser has extensions producing console warnings. React Three Fiber currently also instantiates the deprecated Three.js Clock internally. No suppression or browser security changes were applied.
- Distributed request throttling and public hosting quotas are deployment work. Current request coalescing and GitHub cooldown are per server process.
- Choose the launch style, then finalize real-profile visuals and record the launch clip.

## Project room expansion — 7 September 2026

The room experience replaces the original small project dialog described above; the About dialog remains.

- Automated suite: 23 tests, adding shared room walls/furniture, normalized movement, station proximity, route reachability, repository identity validation, README sanitization, table rendering, relative/root-relative image links, heading anchors, content and gallery caps, independent optional-section failures, private-repository rejection, and project-cache coalescing/expiry/invalidation.
- Browser: pixel and 3D interiors visibly rendered at desktop and 390-pixel responsive width. Overview excerpts, README tables, language percentages/topics, and the sample image gallery opened through their station controls.
- Mobile emulation: 18 directional-button taps moved the explorer from the entrance into bookshelf range; focusing the room and pressing Enter opened the README. The mobile reading panel filled the viewport and displayed scrollable content.
- Escape closed the panel while retaining the room. Enter at the exit returned to the exterior, and Enter at the restored doorway reopened the same project. Browser Back exited an entered room. Direct room URLs restored both tested styles, and Share room displayed a successful clipboard confirmation.
- Live data: `/api/project/octocat/Hello-World` returned public details; its actual “Hello World!” README and source URL were verified in the browser. Sample rooms use complete fictional fixtures without credentials.
- Formatting, TypeScript, production build, and GitHub CI are required for this milestone.

Real touch hardware, Safari, forced graphics failure, and live authenticated/Redis integrations remain unverified. Automated failure cases use injected responses. Browser checks used native Brave controls because the in-app browser connector could not initialize. Existing browser extensions and upstream Three.js deprecations produced warnings; no browser security settings were changed.

## Initial Vercel deployment — 7 September 2026

Production domain: https://dev-island-ashen.vercel.app. The Vercel cloud build succeeded on Node 22. Anonymous HTTP checks returned 200 for the homepage, a direct room URL, the sample project API, live `octocat/Hello-World` details, and the PNG social-card endpoint. The homepage’s OG-image URL uses the production domain. The deployed 3D room rendered successfully in Brave without a Vercel login prompt.

The initial deployment uses the existing no-token GitHub REST mode and per-instance memory caches. GitHub pushes remain separate from production deployment. The repository is private.

### Guide and passport — 2026-09-07

- 26 unit tests, TypeScript, formatting and production build passed.
- Brave native UI: Pip introduction, three-room tour, successive room URLs, Finish tour returns outside, 3/6 stamps survive reload, all six stamps unlock completion reward. Final room checked in Miniature 3D; screenshot confirms room and passport layouts.
- Souvenir export reached the native Save dialog with the expected passport filename. Save was disabled in automation; disk download was not verified and the dialog was cancelled.
- Mobile layout rules are implemented; this feature pass did not repeat hardware/mobile or storage-denied browser tests.

### README cards, trailers and custom layouts — 2026-09-07

- 35 unit tests passed. Added coverage for Markdown appearance/customization links, camera continuity and empty islands, recording-format selection, custom project ownership/length/identity validation, layout ordering and canonical-data preservation, and retaining passport stamps when a custom view hides buildings.
- TypeScript, production build and repository formatting checks passed.
- Local HTTP: custom sample page responds 200 with the selected layout and introduction serialized; custom PNG responds 200 with a valid PNG signature; disallowed repository owners and malformed usernames return 400 from the card endpoint.
- Rendered and visually inspected default six-building and custom two-building PNG cards, including project labels and palette changes.
- **Browser QA limitation:** native Brave inspection was interrupted by user activity, then the native pipe failed to start even after resetting the connection. The in-app browser connection also failed with its missing `classic-level.mjs` dependency; no alternate browser providers were available. New dialog interactions, actual video encoding/playback/download and mobile layouts have not been verified end to end in this feature pass. The earlier guide/room checks above do not validate these new dialogs.
- Video availability is detected at runtime and exported formats are labeled. No claim of universal social-platform upload compatibility; WebM may require conversion. Capture cleanup, cancellation, and recording errors are handled in code; actual browser behavior remains part of the outstanding QA above.

### Building styles and night mode — 2026-09-07

- 42 tests passed: stable repository-based style selection, building/night URL round trips, invalid/duplicate/oversized style rejection, README-card setting preservation, day/night palette behavior, all 12 pixel style/lighting render combinations, and wall-decoration bounds. Existing room reachability/collision and passport tests continue to pass.
- TypeScript, Next production build, formatting, and CI for the renderer changes passed. Local custom night room URL and night card returned HTTP 200; invalid style input returned HTTP 400 from the card endpoint.
- Visually inspected PNGs from the actual pixel painter for all six styles in daylight and night, the shared decoration sheet, and a night README card with six distinct buildings. Generated artifacts are local/ignored, reproducible with `pnpm render:previews`.
- Retried the native Brave connection before this work. It still failed with “Sky Computer Use native pipe startup failed.” This pass therefore does not establish interactive mobile correctness, 3D visual correctness, or actual trailer encoding/download. Those browser checks remain outstanding from the prior release. Offline pixel/card checks do not substitute for them.
- Decorations retain the existing room station locations and collision rules. Night animation receives the reduced-motion setting; its runtime behavior still needs a browser check.

### Project peeks, doorway entry and stories — 2026-09-07

Implemented release:

- Buildings expose a project peek with an explicit Enter action. 3D buildings highlight on hover/focus; pixel buildings have a selection outline.
- Entry follows a walkable path, then opens the 3D door with a short camera move. Skip opens the room immediately. Escape, Cancel, navigation, hidden documents, modal opening and renderer changes cancel the sequence. Reduced-motion mode opens immediately. Tour room-to-room navigation remains direct.
- Story panels show descriptions, source links, screenshots and explicit README Problem/Role/Results sections. No role or outcome is inferred when absent. Sample claims are fictional fixture content.
- Movement keys require focus inside a game stage. Island generation uses one router navigation, with a visible cancel link and a retry error page.
- Invalid personal profiles return 404. Personal and customized sample links retain appearance/project selection in metadata. The unchanged homepage uses the actual 3D capture; personalized images use a deterministic isometric illustration built in code from the island's project styles.

Verification:

- 50 automated tests pass, including all doorway pairs, conservative story extraction, appearance/room metadata and actual day/night PNG encoding at 1200×630. Existing collision, cache, sanitization, custom layout and passport tests pass.
- TypeScript, formatting and the production build pass. The cloud build succeeded on Node 22.
- Local HTTP: invalid profiles return 404 to browser and Twitterbot user agents; personal and sample room metadata contain the selected project title and appearance in the image URL.
- Production HTTP after the first deployment: homepage, Nabeel-javed's personal island, selected sample room, story API and personalized night PNG return 200. Invalid profile returns 404 for browser and Twitterbot requests. Story API includes explicit problem/role/outcome fields. PNG was saved and visually inspected; homepage metadata retains the v3 real-capture JPEG.
- Runtime PNG verification caught unsupported SVG fragments/text; those were replaced with renderer-supported markup and a PNG regression test was added.

Limits: native Brave automation opened the local and production test URLs but returned a blank screenshot and no page accessibility controls, even after reconnecting and raising the window. This release therefore does **not** establish an interactive browser pass for entrance timing, cancel/skip, mobile layout, keyboard focus, reduced motion or actual trailer recording/playback/download. Earlier browser checks above do not validate these new behaviors. Test those flows on real mobile hardware and Safari as well.

Production still has no configured GitHub token or Upstash credentials. Public REST data and per-process memory caching remain available; authenticated pinned projects/contribution history, distributed caching/throttling and traffic-spike capacity remain unverified deployment work. No credentials, accounts or browser security settings were changed.

### 3D atmosphere polish — 2026-09-07

- Added coastal rocks, three expanding shoreline rings, two orbiting/flapping daytime gulls, and chimney smoke for cottage/cafe buildings. Stronger directional lighting and lower ambient fill make building faces and shadows more distinct.
- Rooms now include gently swaying pleated curtains and a hanging lamp, a moving clock hand and a small window-dust particle field. Night uses warm lamp lighting. All new ambient animations use a fixed time when reduced motion is requested; no new dependencies or collision obstacles were added.
- 50 existing tests, TypeScript and production build passed. Browser access recovered during this pass: native Brave screenshots confirm day/night island and room rendering, a normal entrance completed into moss-ui, the corner lighting toggle updated the scene and URL, and the in-room README opened successfully. Clock placement and night hint contrast were corrected after visual inspection.
- Reduced-motion behavior was reviewed in source, not exercised through browser emulation. Real-device mobile performance, Safari and video encoding remain unmeasured; no FPS claims are made. This limited browser pass does not close every outstanding check from prior releases.

### Perspective room interiors — 2026-09-07

- Added a perspective camera that frames the room when its canvas resizes, with zoom, alternate viewing angles and reset controls. Rounded furniture, desk chairs, individual keyboard keys, mugs, small plants, a wall shelf and a seating nook add depth while retaining the existing station collision footprints and blocked corner.
- Station hover/focus highlights identify interactive objects. Mobile controls have larger targets and dedicated space; short screens can scroll the room layout.
- 51 tests passed, including projection checks across five canvas sizes and three viewing angles. TypeScript, production build and formatting passed during implementation.
- Native Brave visual checks confirmed the desktop room, zoom, angle change, reset and README side panel. The room refits alongside the panel. At an emulated 390 × 700 viewport, the room and touch/camera controls remain visible and the README opens as a full-screen panel.
- This is browser emulation, not real-device performance testing. Safari, physical phones and reduced-motion emulation remain untested in this pass. Existing Three.js deprecation warnings are visible in development; no frame-rate claims are made.

### Fullscreen immersive rooms — 2026-09-07

- The 3D scene now fills the viewport behind floating navigation and detail panels. Default framing uses a close, lower perspective; drag rotation, wheel/pinch zoom, a reset action and an optional whole-room view use OrbitControls. The camera follows character movement, more closely on narrow canvases.
- Added rotating geometry over the technology desk, animated demo monitor bars, a moving book page and rising mug steam. Reduced motion fixes these animations and skips camera arrival interpolation/damping.
- 51 tests, TypeScript, production build and formatting passed. Native Brave screenshots confirmed the close desktop interior, readable overlay README, emulated 390 × 680 mobile view, viewing-angle control and whole-room toggle. Mobile camera controls were moved below the character after visual review.
- Physical-phone performance, Safari and pinch gestures on real touch hardware remain unmeasured. Reduced-motion handling was reviewed in source, not browser-emulated in this pass.
