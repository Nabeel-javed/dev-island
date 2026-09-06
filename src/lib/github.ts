import { Redis } from '@upstash/redis';
import { createIslandCache, MemoryStore, type CachedIsland, type IslandStore } from './cache';
import { DEMO } from './demo';
import { Island, Project, safeHomepage, selectProjects, validUsername } from './island';
export class GitHubError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}
let coolingUntil = 0,
  active = 0;
export async function github(path: string, body?: unknown) {
  if (Date.now() < coolingUntil)
    throw new GitHubError('GitHub is resting for a moment. Please try again later.', 429);
  if (active >= 12)
    throw new GitHubError('A few islands are arriving at once. Please try again shortly.', 503);
  active++;
  try {
    const response = await fetch('https://api.github.com' + path, {
      method: body ? 'POST' : 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'dev-island',
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    });
    if (response.status === 404)
      throw new GitHubError('That GitHub profile could not be found.', 404);
    if (
      response.status === 429 ||
      (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0')
    ) {
      const retry = Number(response.headers.get('retry-after')),
        reset = Number(response.headers.get('x-ratelimit-reset'));
      coolingUntil = Math.max(Date.now() + 60000, reset ? reset * 1000 : Date.now() + retry * 1000);
      throw new GitHubError(
        'GitHub’s request limit has been reached. Try again after a little break.',
        429,
      );
    }
    if (!response.ok)
      throw new GitHubError(
        'GitHub could not load this profile right now. Please try again later.',
      );
    return response.json();
  } catch (error) {
    if (error instanceof GitHubError) throw error;
    throw new GitHubError('GitHub took too long to respond. Please try again.');
  } finally {
    active--;
  }
}
type RestRepo = {
  owner: { login: string };
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  homepage: string | null;
  updated_at: string;
  fork: boolean;
  archived: boolean;
  private: boolean;
};
function restRepo(r: RestRepo): Project {
  return {
    id: String(r.id),
    owner: r.owner.login,
    name: r.name,
    description: r.description ?? '',
    language: r.language ?? '',
    stars: r.stargazers_count,
    url: r.html_url,
    homepage: safeHomepage(r.homepage),
    updatedAt: r.updated_at,
    fork: r.fork,
    archived: r.archived,
    private: r.private,
  };
}
type GraphRepo = {
  owner: { login: string };
  id: string;
  name: string;
  description: string | null;
  primaryLanguage: { name: string } | null;
  stargazerCount: number;
  url: string;
  homepageUrl: string | null;
  updatedAt: string;
  isFork: boolean;
  isArchived: boolean;
  isPrivate: boolean;
};
const fields =
  'id owner { login } name description primaryLanguage { name } stargazerCount url homepageUrl updatedAt isFork isArchived isPrivate';
function graphRepo(r: GraphRepo): Project {
  return {
    id: r.id,
    owner: r.owner.login,
    name: r.name,
    description: r.description ?? '',
    language: r.primaryLanguage?.name ?? '',
    stars: r.stargazerCount,
    url: r.url,
    homepage: safeHomepage(r.homepageUrl),
    updatedAt: r.updatedAt,
    fork: r.isFork,
    archived: r.isArchived,
    private: r.isPrivate,
  };
}
async function fetchPublicIsland(login: string): Promise<Island> {
  const started = Date.now();
  if (process.env.GITHUB_TOKEN) {
    const query = `query($login:String!,$after:String){user(login:$login){ login name bio location followers{totalCount} pinnedItems(first:6,types:REPOSITORY){nodes{... on Repository{${fields}}}} repositories(first:100,after:$after,privacy:PUBLIC,isFork:false,ownerAffiliations:OWNER,orderBy:{field:STARGAZERS,direction:DESC}){nodes{${fields}} pageInfo{hasNextPage endCursor}} contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
    let result = await github('/graphql', { query, variables: { login } });
    if (result.errors) {
      if (result.errors.some((e: { type: string }) => e.type === 'NOT_FOUND'))
        throw new GitHubError('That GitHub profile could not be found.', 404);
      throw new GitHubError(
        'The GitHub integration is unavailable. Please check its public-data token.',
      );
    }
    const u = result.data?.user;
    if (!u)
      throw new GitHubError(
        'That GitHub user could not be found. Organization profiles are not supported yet.',
        404,
      );
    const pinned = u.pinnedItems.nodes.map(graphRepo),
      owned: Project[] = u.repositories.nodes.map(graphRepo);
    let pages = 1;
    while (
      selectProjects(pinned, owned).length < 6 &&
      result.data.user.repositories.pageInfo.hasNextPage &&
      pages < 10
    ) {
      result = await github('/graphql', {
        query,
        variables: { login, after: result.data.user.repositories.pageInfo.endCursor },
      });
      if (result.errors || !result.data?.user) break;
      owned.push(...result.data.user.repositories.nodes.map(graphRepo));
      pages++;
    }
    console.info(
      JSON.stringify({
        event: 'island_generated',
        source: 'graphql',
        durationMs: Date.now() - started,
      }),
    );
    return {
      login: u.login,
      name: u.name || u.login,
      bio: u.bio || '',
      location: u.location || '',
      followers: u.followers.totalCount,
      projects: selectProjects(pinned, owned),
      contributions: u.contributionsCollection.contributionCalendar.weeks.flatMap(
        (w: { contributionDays: { date: string; contributionCount: number }[] }) =>
          w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
      ),
      totalContributions: u.contributionsCollection.contributionCalendar.totalContributions,
      source: 'github',
      updatedAt: new Date().toISOString(),
    };
  }
  const u = await github('/users/' + encodeURIComponent(login));
  if (u.type !== 'User')
    throw new GitHubError(
      'Enter a personal GitHub username. Organization islands are not supported yet.',
      400,
    );
  const repos: Project[] = [];
  const pages = Math.min(Math.ceil(u.public_repos / 100), 5);
  for (let page = 1; page <= pages; page++)
    repos.push(
      ...(
        await github(
          `/users/${encodeURIComponent(login)}/repos?per_page=100&page=${page}&sort=updated`,
        )
      ).map(restRepo),
    );
  console.info(
    JSON.stringify({ event: 'island_generated', source: 'rest', durationMs: Date.now() - started }),
  );
  return {
    login: u.login,
    name: u.name || u.login,
    bio: u.bio || '',
    location: u.location || '',
    followers: u.followers,
    projects: selectProjects([], repos),
    contributions: [],
    totalContributions: null,
    source: 'github',
    updatedAt: new Date().toISOString(),
    notice:
      'Public repositories are live. Pinned projects and the contribution garden become available when the host configures a GitHub API token.' +
      (u.public_repos > 500
        ? ' Showing selections from the 500 most recently updated repositories.'
        : ''),
  };
}
const memory = new MemoryStore();
let store: IslandStore = memory;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = Redis.fromEnv();
  store = {
    async get(key) {
      try {
        return await redis.get<CachedIsland>('island:v2:' + key);
      } catch {
        return memory.get(key);
      }
    },
    async set(key, value) {
      await memory.set(key, value);
      try {
        await redis.set('island:v2:' + key, value, { ex: 604800 });
      } catch {
        console.warn(JSON.stringify({ event: 'cache_unavailable' }));
      }
    },
  };
}
const cached = createIslandCache(store, fetchPublicIsland);
export async function getIsland(username: string) {
  if (!validUsername(username)) throw new GitHubError('Enter a valid GitHub username.', 400);
  if (username.toLowerCase() === 'demo') return DEMO;
  return cached(username);
}
