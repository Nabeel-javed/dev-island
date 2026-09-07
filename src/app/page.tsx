import { cache } from 'react';
import { islandMetadata } from '@/lib/island-metadata';
import { getCustomIsland } from '@/lib/custom-island';
import { recordParams } from '@/lib/customization';
import IslandApp from '@/components/island-app';
import { DEMO } from '@/lib/demo';
import { appearanceFromRecord } from '@/lib/island';
type Query = Record<string, string | string[] | undefined>;
const load = cache((query: string) => getCustomIsland(DEMO, new URLSearchParams(query)));
export async function generateMetadata({ searchParams }: { searchParams: Promise<Query> }) {
  const params = recordParams(await searchParams);
  if (
    !['project', 'projects', 'buildings', 'intro', 'palette', 'lighting', 'style', 'avatar'].some(
      (key) => params.has(key),
    )
  )
    return {};
  try {
    return islandMetadata(await load(params.toString()), params);
  } catch {
    return {
      title: 'This custom island could not load — Dev Island',
      robots: { index: false, follow: false },
    };
  }
}
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  try {
    return (
      <IslandApp
        island={await load(recordParams(query).toString())}
        initialAppearance={appearanceFromRecord(query)}
      />
    );
  } catch {
    return (
      <main style={{ padding: '100px 30px', maxWidth: 650 }}>
        <h1>This custom island could not load.</h1>
        <p>Check the project selection and introduction in your link.</p>
        <a href="/">Return to the sample island →</a>
      </main>
    );
  }
}
