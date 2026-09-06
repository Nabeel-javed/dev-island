import type { Island } from './island';
export type CachedIsland = { island: Island; storedAt: number };
export interface IslandStore {
  get(key: string): Promise<CachedIsland | null>;
  set(key: string, value: CachedIsland): Promise<void>;
}
export class MemoryStore implements IslandStore {
  private items = new Map<string, CachedIsland>();
  async get(key: string) {
    return this.items.get(key) ?? null;
  }
  async set(key: string, value: CachedIsland) {
    this.items.delete(key);
    this.items.set(key, value);
    if (this.items.size > 1000) this.items.delete(this.items.keys().next().value!);
  }
}
export const FRESH_MS = 6 * 60 * 60 * 1000,
  STALE_MS = 7 * 24 * 60 * 60 * 1000;
export function createIslandCache(
  store: IslandStore,
  fetcher: (key: string) => Promise<Island>,
  now = Date.now,
) {
  const pending = new Map<string, Promise<Island>>();
  return async (username: string) => {
    const key = username.toLowerCase();
    const cached = await store.get(key);
    if (cached && now() - cached.storedAt < FRESH_MS) return cached.island;
    const existing = pending.get(key);
    if (existing) return existing;
    const request = (async () => {
      try {
        const island = await fetcher(key);
        await store.set(key, { island, storedAt: now() });
        return island;
      } catch (error) {
        if (
          cached &&
          now() - cached.storedAt < STALE_MS &&
          !(error instanceof Error && 'status' in error && error.status === 404)
        )
          return {
            ...cached.island,
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
