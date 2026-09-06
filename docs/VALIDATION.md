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
