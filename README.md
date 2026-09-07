# Dev Island

**Your code, a world of its own.** A playable GitHub portfolio, with a cozy pixel village and a miniature 3D island to compare.

## Live deployment

**https://dev-island-ashen.vercel.app** — Vercel project `dev-island` in `nabeeljavaids-projects`. The GitHub repository remains private. Both rendering styles and project rooms are deployed.

The initial deployment uses public REST data and the in-memory cache. A dedicated GitHub token and shared Redis are not configured yet, so pinned projects and contribution gardens remain unavailable for real profiles. This does not affect the fictional sample or public repository details.

Vercel uses Node 22, the pinned pnpm version, and `vercel.json`. Social metadata automatically uses Vercel’s production domain; `SITE_URL` can override it. Deployments currently run through the CLI, independently of GitHub pushes:

```sh
pnpm dlx vercel deploy --prod --scope nabeeljavaids-projects
```

## Run locally

Requires Node.js 22.x and pnpm 10.33.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open **http://localhost:3100**. The fictional sample world works entirely without credentials.

- [Pixel preview](http://localhost:3100/?style=pixel#explore)
- [3D preview](http://localhost:3100/?style=3d#explore)
- Enter a public GitHub username to generate a real island.

## Explore

Walk with **WASD / arrow keys**, or the directional buttons on a phone. Press **Enter or E** near a building to enter its project room. Buildings can also be clicked, and every project has a normal HTML card below the scene. **Escape** closes a reading panel first, then returns to the island.

Inside each project room, explore four stations: an overview board, README bookshelf, technology desk, and demo display. Walk up and press **Enter/E**, click the furniture, or use the station buttons. Desktop uses a side panel; phones use a full-screen reading panel. Back to island and the exit return you to the building’s doorway.

- [Sample pixel room](http://localhost:3100/?style=pixel&project=demo%2Fmoss-ui)
- [Sample 3D room](http://localhost:3100/?style=3d&project=demo%2Fmoss-ui)

**Share room** copies a direct room link. Browser Back returns to the exterior after entering a room. Invalid room links fall back to the island with an explanation. The existing postcard download exports the exterior island.

Choose one of four explorers and three palettes. The current style and appearance are saved in the URL. Share copies this link; the download button exports a PNG postcard. Visitors do not need accounts.

## GitHub data and credentials

Copy `.env.example` to `.env.local` only when you want additional integrations. Never commit credentials.

| Variable                                              | Purpose                                                                                                                                                                                                         |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN`                                        | Optional dedicated fine-grained token with public repository read access only. Enables pinned repositories and the contribution calendar through GraphQL. Do not grant private repository or write permissions. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Optional shared Redis cache. Configure before a multi-instance public deployment.                                                                                                                               |
| `SITE_URL`                                            | Public origin for social-card metadata. Defaults to `http://localhost:3100`.                                                                                                                                    |

Without a token, the server reads public profiles and repositories through GitHub REST. It displays **unavailable**, rather than fabricated, contribution data. REST fallback selects from at most the 500 most recently updated repositories and explicitly notes this limit for larger accounts. GitHub's unauthenticated quota is shared by the server's outbound IP.

Profiles are cached for six hours. Concurrent requests for the same profile within a server instance share one upstream fetch. On temporary upstream failure, cached snapshots can be served for up to seven days; a confirmed deleted profile is not served from stale cache. Development uses a bounded memory cache; Redis supplies shared persistence across deployed instances. Cooldown and in-flight concurrency controls are currently per process.

The `demo` name is reserved for the fictional sample. Organization profiles are not supported. A generated island is a visualization of public data, not an identity claim or endorsement by its profile owner.

## Project room data

Rooms fetch details on entry through `/api/project/[owner]/[repo]`: public repository metadata, sanitized README content, language breakdown, and repository topics. Canonical owner/name identifiers support pinned repositories owned by someone else.

README rendering supports Markdown, tables, code blocks, supported HTML, relative links, and images. Scripts, frames, event handlers, and unsafe link protocols are removed. Introductions and feature text are excerpts, without AI-generated claims. The gallery takes up to six README images, excluding common badges; images load in the visitor’s browser and retain their original owners’ rights. Website and source links open separate tabs.

README display is capped at 200 KiB with a GitHub link for larger documents. Missing documentation has an explicit empty state. Failed optional sections remain independent, with retry; incomplete responses are cached for one minute. Complete details use a separate six-hour cache, coalesced requests, and up to seven-day stale fallback on temporary outages. Confirmed unavailable/private repository responses invalidate their detail cache. The shared Redis namespace is `project:v1`; island summaries use `island:v2` after adding repository owners.

## Architecture

- **Next.js / React / TypeScript:** application shell, shareable pages, server API, social images.
- **Phaser:** original pixel artwork, animation and hit testing.
- **Three.js / React Three Fiber:** original low-poly models, orthographic camera and instanced contribution garden.
- **Rooms:** Canvas 2D pixel interiors and primitive 3D interiors share furniture locations, collision, interaction zones, and repository-based decoration. Only the current scene is mounted.
- Shared model, project selection, appearance parsing, movement and collision rules feed both renderers. Only the selected renderer is mounted.
- All artwork is produced locally from code. No runtime AI calls, externally hosted fonts, or purchased asset packs.

| Interface                      | Result                                                                     |
| ------------------------------ | -------------------------------------------------------------------------- |
| `/`                            | Sample world and username form                                             |
| `/u/[username]`                | Public profile island                                                      |
| `/api/island/[username]`       | Normalized profile, featured projects, contributions, source and timestamp |
| `/api/og?username=…&palette=…` | 1200 × 630 PNG social card                                                 |

Room links add `project=owner/repository`, restricted in the UI to that island’s featured projects.

Share parameters: `style=pixel\|3d`, `palette=lagoon\|sunset\|lavender`, and `avatar=explorer\|gardener\|sailor\|astronaut`. Invalid appearance values use defaults.

## Checks

```sh
pnpm format:check
pnpm test
pnpm build
pnpm typecheck
```

CI runs these checks on pushes to `main` and pull requests. See [validation notes](docs/VALIDATION.md) for actual browser checks and limitations. Format changes with `pnpm format`.

## Current milestone and launch

Both visual previews are implemented. The next product decision is choosing the preferred style for the public release; both remain available for comparison. The repository is private during development.

Remaining rollout work: decide whether to retain both styles; configure a public-data GitHub token, shared cache and `SITE_URL`; verify GraphQL and Redis with those credentials; add deployment-level distributed rate limits and a spending cap; check Safari and real mobile hardware; then record the launch demo. No cloud services or paid plans are created by the application.

Accounts, multiplayer, editors, payments and leaderboards are outside this version. See [asset credits](docs/ASSETS.md). Code and original artwork are MIT licensed.

### Island guide and exploration passport

Meet Pip on the island to start a self-paced tour of up to three featured rooms. Leave the tour at any time. Every room visit collects a passport stamp, saved per island in your browser. Visit all featured rooms to unlock a downloadable PNG souvenir and a link to create your own island. Progress follows repository identities even if buildings are reordered.
