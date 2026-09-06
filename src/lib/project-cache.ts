import type { ProjectDetails } from './project';
import { FRESH_MS, STALE_MS } from './cache';
export type ProjectSnapshot = { value: ProjectDetails; storedAt: number };
export interface ProjectStore {
  get(key: string): Promise<ProjectSnapshot | null>;
  set(key: string, value: ProjectSnapshot): Promise<void>;
  delete(key: string): Promise<void>;
}
export class ProjectMemoryStore implements ProjectStore {
  private items = new Map<string, ProjectSnapshot>();
  async get(key: string) {
    return this.items.get(key) ?? null;
  }
  async set(key: string, value: ProjectSnapshot) {
    this.items.delete(key);
    this.items.set(key, value);
    if (this.items.size > 300) this.items.delete(this.items.keys().next().value!);
  }
  async delete(key: string) {
    this.items.delete(key);
  }
}
export function createProjectCache(
  store: ProjectStore,
  fetcher: (key: string) => Promise<ProjectDetails>,
  now = Date.now,
) {
  const pending = new Map<string, Promise<ProjectDetails>>();
  return async (identity: string) => {
    const key = identity.toLowerCase();
    const cached = await store.get(key);
    if (cached && now() - cached.storedAt < FRESH_MS) return cached.value;
    const existing = pending.get(key);
    if (existing) return existing;
    const request = (async () => {
      try {
        const value = await fetcher(key);
        // Retry incomplete sections soon instead of caching an outage for six hours.
        const incomplete =
          value.readme.status === 'unavailable' || value.languageStatus === 'unavailable';
        await store.set(key, { value, storedAt: now() - (incomplete ? FRESH_MS - 60000 : 0) });
        return value;
      } catch (error) {
        if (
          error instanceof Error &&
          'status' in error &&
          (error.status === 404 || error.status === 403)
        ) {
          await store.delete(key);
          throw error;
        }
        if (cached && now() - cached.storedAt < STALE_MS)
          return {
            ...cached.value,
            notice: 'GitHub is temporarily unavailable. Showing the last saved public snapshot.',
          };
        throw error;
      } finally {
        pending.delete(key);
      }
    })();
    pending.set(key, request);
    return request;
  };
}
