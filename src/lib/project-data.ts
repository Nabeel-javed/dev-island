import { Redis } from '@upstash/redis';
import { github, GitHubError } from './github';
import { safeHomepage, validUsername } from './island';
import { DEMO } from './demo';
import { projectKey, validRepository, type ProjectDetails } from './project';
import { renderReadme } from './readme';
import {
  createProjectCache,
  ProjectMemoryStore,
  type ProjectStore,
  type ProjectSnapshot,
} from './project-cache';

async function fetchProject(key: string): Promise<ProjectDetails> {
  const [owner, name] = key.split('/');
  const path = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
  const repo = await github(path);
  if (repo.private || repo.visibility === 'private' || repo.visibility === 'internal')
    throw new GitHubError('This public project is unavailable.', 404);
  const [readme, languages] = await Promise.allSettled([
    github(path + '/readme'),
    github(path + '/languages'),
  ]);
  let content: ProjectDetails['readme'] = {
    status: 'missing',
    html: '',
    introduction: '',
    features: '',
    images: [],
    url: repo.html_url,
    truncated: false,
  };
  if (readme.status === 'fulfilled' && readme.value.encoding === 'base64') {
    content = await renderReadme(
      Buffer.from(readme.value.content || '', 'base64').toString('utf8'),
      readme.value.html_url,
    );
  } else if (readme.status === 'fulfilled') {
    content = { ...content, status: 'available', truncated: true };
  } else if (!(readme.reason instanceof GitHubError && readme.reason.status === 404))
    content.status = 'unavailable';
  return {
    owner: repo.owner.login,
    name: repo.name,
    description: repo.description || '',
    url: repo.html_url,
    homepage: safeHomepage(repo.homepage),
    stars: repo.stargazers_count,
    license: repo.license?.name ?? null,
    updatedAt: repo.updated_at,
    fetchedAt: new Date().toISOString(),
    topics: repo.topics || [],
    languages:
      languages.status === 'fulfilled'
        ? Object.entries(languages.value as Record<string, number>)
            .map(([name, bytes]) => ({ name, bytes }))
            .filter((l) => l.bytes > 0)
            .sort((a, b) => b.bytes - a.bytes)
        : [],
    languageStatus: languages.status === 'fulfilled' ? 'available' : 'unavailable',
    readme: content,
    source: 'github',
  };
}
const memory = new ProjectMemoryStore();
let store: ProjectStore = memory;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = Redis.fromEnv();
  store = {
    async get(key) {
      try {
        return await redis.get<ProjectSnapshot>('project:v1:' + key);
      } catch {
        return memory.get(key);
      }
    },
    async set(key, value) {
      await memory.set(key, value);
      try {
        await redis.set('project:v1:' + key, value, { ex: 604800 });
      } catch {
        console.warn(JSON.stringify({ event: 'project_cache_unavailable' }));
      }
    },
    async delete(key) {
      await memory.delete(key);
      try {
        await redis.del('project:v1:' + key);
      } catch {
        console.warn(JSON.stringify({ event: 'project_cache_unavailable' }));
      }
    },
  };
}
const cached = createProjectCache(store, fetchProject);
export async function getProject(owner: string, name: string): Promise<ProjectDetails> {
  if (!validUsername(owner) || !validRepository(name))
    throw new GitHubError('Enter a valid repository owner and name.', 400);
  if (owner.toLowerCase() === 'demo') {
    const project = DEMO.projects.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (!project) throw new GitHubError('This sample project could not be found.', 404);
    const readme = await renderReadme(
      `# ${project.name}\n\n${project.description}\n\nThis is a fictional project created to demonstrate Dev Island’s rooms.\n\n## Features\n\n- A thoughtful interface with keyboard access\n- Responsive layouts for small screens\n- Customizable colors and a calm reading experience\n\n## Getting started\n\nExplore the four stations in this room. In a real project, this bookshelf displays the repository’s own README.\n\n\`\`\`text\nwalk → discover → build something\n\`\`\`\n\n## Design notes\n\n| Principle | Approach |\n| --- | --- |\n| Clarity | Keep the important things easy to find |\n| Accessibility | Support keyboard and touch |\n| Delight | Leave room for small discoveries |`,
      'https://github.com',
    );
    readme.images = [
      {
        src: '/room-sample.svg',
        alt: 'Original illustrative interface for the fictional sample project',
      },
    ];
    return {
      ...project,
      license: 'MIT (sample)',
      fetchedAt: DEMO.updatedAt,
      topics: ['sample-project', 'creative-coding', 'accessible-design'],
      languages: [
        { name: project.language, bytes: 850 },
        { name: 'CSS', bytes: 150 },
      ],
      languageStatus: 'available',
      readme,
      source: 'demo',
    };
  }
  try {
    return await cached(projectKey(owner, name));
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404)
      throw new GitHubError('This public project could not be found.', 404);
    throw error;
  }
}
