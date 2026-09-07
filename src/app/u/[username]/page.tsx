import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getCustomIsland } from '@/lib/custom-island';
import { appearanceFromRecord, validUsername } from '@/lib/island';
import IslandApp from '@/components/island-app';
import { getIsland, GitHubError } from '@/lib/github';
import { islandMetadata } from '@/lib/island-metadata';
type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
const load = cache(async (username: string, query: string) => {
  if (!validUsername(username)) notFound();
  try {
    return await getCustomIsland(await getIsland(username), new URLSearchParams(query));
  } catch (error) {
    if (error instanceof GitHubError && [400, 404].includes(error.status)) notFound();
    throw error;
  }
});
async function input(props: Props) {
  const [{ username }, record] = await Promise.all([props.params, props.searchParams]);
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(record))
    if (typeof value === 'string') query.set(key, value);
  return { username, record, query, island: await load(username, query.toString()) };
}
export async function generateMetadata(props: Props) {
  const { island, query } = await input(props);
  return islandMetadata(island, query);
}
export default async function Page(props: Props) {
  const { username, record, island } = await input(props);
  return (
    <IslandApp key={username} island={island} initialAppearance={appearanceFromRecord(record)} />
  );
}
