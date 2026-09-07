# Dev Island product review — 7 September 2026

## Recommendation

Build a more useful playable portfolio: make entering a project delightful, make
the developer's work understandable in seconds, and make creating/sharing an
island reliable. Keep the actual low-poly art direction. More environmental
effects alone will not improve the reason to visit or share.

This is a review and proposed backlog, not an implementation release.

## Evidence and limits

- Reviewed the app shell, room UI, controllers, pixel/3D scene structure, guide,
  passport persistence, editor, profile cards, trailer recording, GitHub loading,
  caches, URL customization and metadata routes, plus the existing test suite.
- All 42 tests passed on this review. These mostly cover data and rendering
  helpers; they do not prove browser interaction or video recording works.
- Live HTTP: `/u/bad_name` returns 200 with an error page and an OG image URL whose
  username is invalid. Invalid island pages should have appropriate error status
  and indexing behavior.
- Live HTTP: `/u/demo?lighting=night&palette=lavender&style=3d` points to
  `/api/og?username=demo`, dropping appearance. That endpoint uses the older
  illustration and does not load the selected island's actual buildings.
- Live API: `/api/island/Nabeel-javed` reports no-token mode and null contribution
  count. Pinned projects and the contribution garden are unavailable in this mode.
- Native UI inspection of the existing island succeeded, but ongoing browser
  activity interrupted deeper checks; the isolated in-app browser was unavailable.
  Mobile, failed-WebGL recovery and video record/play/download need dedicated QA.
- No load testing, third-party security testing, or new credential setup occurred.

## Fixes and quality work

| Priority | Finding                                                        | Evidence / proposed outcome                                                                                                                                                                                                                                                                                                                                                                                    |
| -------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Personalized share previews do not represent the selected view | Live metadata confirmed; `src/app/u/[username]/page.tsx` ignores search parameters in metadata and `/api/og` renders generic buildings. Include validated appearance/project selection and project-specific room titles; extend the authentic 3D preview direction to personal islands.                                                                                                                        |
| P0       | Invalid island pages return HTTP 200                           | Live confirmed; page catches all errors and renders a normal page. Separate invalid/not-found profiles from temporary upstream failures; provide correct status, retry and indexing behavior.                                                                                                                                                                                                                  |
| P0       | GitHub readiness for a traffic spike                           | Live no-token mode. Use an appropriately scoped server-side integration, shared cache and coordinated request limits. Current cache coalescing/cooldown operate per process. GitHub documents 60 unauthenticated REST requests/hour per originating IP: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api. This is a reliability concern, not a measured traffic capacity claim. |
| P1       | Movement keys are handled across the page                      | Source-confirmed: `use-controller.ts` attaches global key handlers, excludes form controls but does not require focus inside the game. Scope controls to an active/focused scene so normal page arrow scrolling works. Browser reproduction still needed.                                                                                                                                                      |
| P1       | Island generation lacks client cancellation/timeout            | Source-confirmed: `generate()` prefetches the API, then navigates to a server page that loads the island again. Remove the redundant preflight where practical; give long-running loads a clear retry/cancel state. Cache may avoid duplicate upstream calls, so do not claim every visit doubles GitHub traffic.                                                                                              |
| P1       | Trailer reliability is unproven end to end                     | Complete record, playback and download tests, including close/reopen, hidden tab, unsupported codec and empty scene. Verify supported browser matrix before advertising universal exports.                                                                                                                                                                                                                     |
| P1       | Performance and graphics recovery need explicit budgets        | Existing DPR cap, instanced garden and fallback messages are good foundations. Add offscreen rendering suspension, quality presets, context-loss recovery and retry; profile real mobile hardware before claiming FPS gains.                                                                                                                                                                                   |
| P1       | Promises and visible data diverge                              | Homepage says every contribution grows something while live no-token profiles show an empty garden. Explain unavailable data without host-configuration jargon, or enable the integration.                                                                                                                                                                                                                     |

## Capability options

Effort is relative implementation complexity, not a delivery estimate. Each option
needs focused browser validation and reduced-motion behavior where applicable.

| ID  | Capability                                                                                    | Visitor benefit                                                                                                                     | Effort       |
| --- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| A   | Doorway sequence: character approaches, door opens, short camera transition, interior appears | Connects the island and room into one coherent place                                                                                | Medium       |
| B   | Hover/focus building highlight, compact project peek and visible Enter action                 | Makes the main interaction discoverable with mouse, keyboard and touch                                                              | Small–medium |
| C   | Touch destination walking, obstacle-aware paths and a contextual enter button                 | Easier phone interaction than tiny direction buttons; preserve D-pad fallback                                                       | Medium–large |
| D   | Gentle water ripples, occasional chimney smoke, one bird route, unique building activity      | Gives the existing world life without overwhelming the projects                                                                     | Medium       |
| E   | Pip as an actual 3D guide, pointing or walking toward the next project                        | Turns the current dialog/tour into an in-world experience                                                                           | Medium–large |
| F   | Limited rotate/zoom, reset camera and Photo mode                                              | Lets visitors inspect and share a good angle; movement must remain intuitive as camera rotates                                      | Medium       |
| G   | Project story cards: problem, result, role, screenshots and demo                              | Makes rooms useful to recruiters and other developers, beyond repeating README text                                                 | Medium       |
| H   | Technology station with verified framework/dependency information                             | Distinguishes a stack from the current language-by-byte chart; label detected evidence and unknowns                                 | Medium       |
| I   | Contribution garden inspection: date/count on a plant, recent activity and gentle growth      | Makes existing contribution data meaningful and interactive; requires integration                                                   | Medium       |
| J   | Live editor preview, undo, local saved designs and explicit share/apply                       | Removes full-page edit/reload friction and lost unsaved choices                                                                     | Medium       |
| K   | Stable saved island links and owner-controlled portfolio settings                             | Gives creators a durable portfolio destination; requires storage and ownership verification                                         | Large        |
| L   | Project search and a quick portfolio view with demo/GitHub/contact links                      | Lets time-limited visitors get value without completing a game                                                                      | Small–medium |
| M   | Unified sharing studio: real 3D stills, room cards, portrait/square/landscape trailers        | Makes distribution a first-class flow and provides reusable assets                                                                  | Medium–large |
| N   | Lightweight discovery quests and a clear passport-completion animation                        | Rewards exploring project content, with progress tied to meaningful actions                                                         | Small–medium |
| O   | Opt-in ambient audio and interaction sounds, with persistent mute                             | Adds atmosphere for visitors who want it; silent by default                                                                         | Small–medium |
| P   | Aggregate funnel measurements and a feedback action                                           | Shows whether visitors generate islands, enter rooms and share; exclude README text, custom intros and other content from telemetry | Medium       |
| Q   | Opt-in island directory and curated featured islands                                          | Creates a way to discover other developers; requires consent, moderation and durable entries                                        | Large        |

## Suggested sequence

1. Reliability and usability: P0/P1 fixes, complete trailer/mobile QA, B and L.
2. Signature interaction: A, a restrained D, and C after mobile interaction checks.
3. Creator value: G, H and J; enable the contribution integration before I.
4. Sharing and learning: M and P, then F if visitors want camera control.
5. Expansion: E, K, N, O and Q according to observed use.

A strong next release is **reliable creation + project peeks + doorway animation +
project story cards**. Its clear promise is: walk into a developer's work and
understand what they built.

Defer multiplayer, public guestbooks, global leaderboards, token/NFT mechanics and
unrestricted AI chat. They introduce substantial infrastructure or moderation
cost and have weaker connection to the app's current portfolio purpose. Revisit
them only with evidence of visitor demand. More than six projects should use
another district/page of buildings, rather than crowding the existing island.
