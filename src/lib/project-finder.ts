import type { Project } from './island';
export function findProjects(
  projects: Project[],
  query: string,
  language: string,
  unvisited: boolean,
  visited: number[],
) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const seen = new Set(visited);
  return projects.flatMap((project, index) => {
    const haystack =
      `${project.owner} ${project.name} ${project.description} ${project.language}`.toLocaleLowerCase();
    return (!language || project.language === language) &&
      (!unvisited || !seen.has(index)) &&
      terms.every((term) => haystack.includes(term))
      ? [{ project, index }]
      : [];
  });
}
