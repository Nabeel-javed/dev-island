import type { LightingId } from './buildings';
import type { Island, PaletteId, StyleId, AvatarId } from './island';
export function shareLinks(
  origin: string,
  island: Island,
  appearance: {
    lighting?: LightingId;
    palette: PaletteId;
    style: StyleId;
    avatar: AvatarId;
  },
  customization = new URLSearchParams(),
) {
  const page = new URL(
    island.source === 'demo' ? '/' : `/u/${encodeURIComponent(island.login)}`,
    origin,
  );
  for (const [key, value] of Object.entries(appearance)) page.searchParams.set(key, value);
  for (const key of ['projects', 'intro', 'buildings']) {
    const value = customization.get(key);
    if (value !== null) page.searchParams.set(key, value);
  }
  const card = new URL('/api/card', origin);
  card.searchParams.set('username', island.source === 'demo' ? 'demo' : island.login);
  card.searchParams.set('palette', appearance.palette);
  card.searchParams.set('lighting', appearance.lighting ?? 'day');
  for (const key of ['projects', 'intro', 'buildings']) {
    const value = customization.get(key);
    if (value !== null) card.searchParams.set(key, value);
  }
  return {
    page: page.href,
    card: card.href,
    markdown: `[![Explore ${island.login}'s Dev Island](${card.href})](${page.href})`,
  };
}
