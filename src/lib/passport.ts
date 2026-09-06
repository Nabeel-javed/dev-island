import type { Project } from './island';
import { projectKey } from './project';
export function restoreStamps(raw: string | null, projects: Project[]): string[] {
  try {
    const data = JSON.parse(raw || 'null');
    if (data?.version !== 1 || !Array.isArray(data.stamps)) return [];
    const allowed = new Set(projects.map((p) => projectKey(p.owner, p.name)));
    return [
      ...new Set<string>(
        data.stamps
          .slice(0, 1000)
          .filter((s: unknown): s is string => typeof s === 'string')
          .map((s: string) => s.toLowerCase()),
      ),
    ].filter((s) => allowed.has(s));
  } catch {
    return [];
  }
}
export function stampProject(stamps: string[], project: Project): string[] {
  const key = projectKey(project.owner, project.name);
  return stamps.includes(key) ? stamps : [...stamps, key];
}
export function passportComplete(visited: number, total: number) {
  return total > 0 && visited >= total;
}
