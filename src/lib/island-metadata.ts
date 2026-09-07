import type { Metadata } from 'next';
import type { Island } from './island';
import { readAppearance } from './island';
import { projectKey } from './project';

export function islandMetadata(island: Island, params: URLSearchParams): Metadata {
  const room = island.projects.find(
    (p) => projectKey(p.owner, p.name) === params.get('project')?.toLowerCase(),
  );
  const image = new URLSearchParams({
    username: island.source === 'demo' ? 'demo' : island.login,
    ...readAppearance(params),
  });
  for (const key of ['projects', 'buildings', 'intro']) {
    const value = params.get(key);
    if (value !== null) image.set(key, value);
  }
  if (room) image.set('project', projectKey(room.owner, room.name));
  const title = room
    ? `${room.name} — ${island.name}’s Dev Island`
    : `${island.name}’s island — Dev Island`;
  const description =
    room?.description ||
    island.customIntro ||
    island.bio ||
    'Walk into the projects on this playable GitHub island.';
  const images = [{ url: `/api/og?${image}`, width: 1200, height: 630, alt: title }];
  return {
    title,
    description,
    openGraph: { title, description, images },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}
