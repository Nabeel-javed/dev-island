import type { Project } from './island';
import { projectKey, validRepository } from './project';
import { validUsername } from './island';
export function restoreStamps(
  raw: string | null,
  projects: Project[],
  preserveHidden = false,
): string[] {
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
    ].filter((s) => {
      const parts = s.split('/');
      return (
        parts.length === 2 &&
        validUsername(parts[0]) &&
        validRepository(parts[1]) &&
        (preserveHidden || allowed.has(s))
      );
    });
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
