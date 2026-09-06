# Dev Island

**Your code, a world of its own.** A playable GitHub portfolio, with a cozy pixel village and a miniature 3D island to compare.

## Run locally

Requires Node.js 22+ and pnpm 10.33.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open **http://localhost:3100**. The fictional sample world works entirely without credentials.

- [Pixel preview](http://localhost:3100/?style=pixel#explore)
- [3D preview](http://localhost:3100/?style=3d#explore)
- Enter a public GitHub username to generate a real island.

## Explore

Walk with **WASD / arrow keys**, or the directional buttons on a phone. Press **E** near a building to open its project. Buildings can also be clicked, and every project has a normal HTML card below the scene. **Escape** closes a dialog.

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

## Architecture

- **Next.js / React / TypeScript:** application shell, shareable pages, server API, social images.
- **Phaser:** original pixel artwork, animation and hit testing.
- **Three.js / React Three Fiber:** original low-poly models, orthographic camera and instanced contribution garden.
- Shared model, project selection, appearance parsing, movement and collision rules feed both renderers. Only the selected renderer is mounted.
- All artwork is produced locally from code. No runtime AI calls, externally hosted fonts, or purchased asset packs.

| Interface                      | Result                                                                     |
| ------------------------------ | -------------------------------------------------------------------------- |
| `/`                            | Sample world and username form                                             |
| `/u/[username]`                | Public profile island                                                      |
| `/api/island/[username]`       | Normalized profile, featured projects, contributions, source and timestamp |
| `/api/og?username=…&palette=…` | 1200 × 630 PNG social card                                                 |

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

Before public launch: select the style; configure a public-data GitHub token, shared cache and `SITE_URL`; verify GraphQL and Redis with those credentials; add deployment-level distributed rate limits and a spending cap; check Safari and real mobile hardware; then deploy the Next.js project to Vercel and record the launch demo. No cloud services or paid plans are created by the application.

Accounts, multiplayer, editors, payments and leaderboards are outside this version. See [asset credits](docs/ASSETS.md). Code and original artwork are MIT licensed.
