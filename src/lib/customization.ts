import { validUsername, type Island, type Project } from './island';
import { projectKey, validRepository, type ProjectDetails } from './project';
export function readCustomization(params: URLSearchParams) {
  const raw = params.get('projects');
  if (raw !== null && raw.length > 900) throw new Error('Choose up to six public projects.');
  const keys =
    raw === null ? null : raw === '' ? [] : raw.split(',').map((value) => value.toLowerCase());
  if (
    keys &&
    (keys.length > 6 ||
      keys.some((key) => {
        const parts = key.split('/');
        return parts.length !== 2 || !validUsername(parts[0]) || !validRepository(parts[1]);
      }))
  )
    throw new Error('Use up to six valid owner/repository names.');
  const intro = params.get('intro') ?? '';
  if (intro.length > 240) throw new Error('Keep the introduction to 240 characters.');
  return {
    projects: keys === null ? null : [...new Set(keys)],
    introduction: intro.replace(/[\u0000-\u001f\u007f]/g, ' ').trim(),
    active: raw !== null || params.has('intro'),
  };
}
export async function customizeIsland(
  island: Island,
  params: URLSearchParams,
  load: (owner: string, name: string) => Promise<ProjectDetails>,
): Promise<Island> {
  const settings = readCustomization(params);
  if (!settings.active) return island;
  const known = new Map(island.projects.map((p) => [projectKey(p.owner, p.name), p]));
  // Validate the entire selection before making external requests.
  for (const key of settings.projects ?? []) {
    if (
      !known.has(key) &&
      (island.source === 'demo' || key.split('/')[0] !== island.login.toLowerCase())
    )
      throw new Error(
        'Add public projects owned by this profile, or choose an existing featured project.',
      );
  }
  const projects: Project[] =
    settings.projects === null
      ? island.projects
      : await Promise.all(
          settings.projects.map(async (key) => {
            const existing = known.get(key);
            if (existing) return existing;
            const [owner, name] = key.split('/');
            const p = await load(owner, name);
            if (p.owner.toLowerCase() !== island.login.toLowerCase())
              throw new Error('This project no longer belongs to this profile.');
            return {
              owner: p.owner,
              name: p.name,
              id: projectKey(p.owner, p.name),
              description: p.description,
              url: p.url,
              homepage: p.homepage,
              stars: p.stars,
              updatedAt: p.updatedAt,
              language: p.languages[0]?.name ?? '',
            };
          }),
        );
  return {
    ...island,
    projects,
    defaultProjects: island.projects,
    customView: true,
    customIntro: settings.introduction,
  };
}
export function customizationURL(
  current: string,
  projects: Pick<Project, 'owner' | 'name'>[],
  introduction: string,
) {
  const url = new URL(current);
  url.searchParams.delete('project');
  url.searchParams.set('projects', projects.map((p) => projectKey(p.owner, p.name)).join(','));
  if (introduction.trim()) url.searchParams.set('intro', introduction.trim());
  else url.searchParams.delete('intro');
  url.hash = 'explore';
  return url;
}
export function recordParams(record: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const key of ['projects', 'intro'])
    if (typeof record[key] === 'string') params.set(key, record[key]);
  return params;
}
