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
