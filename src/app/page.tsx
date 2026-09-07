import { getCustomIsland } from '@/lib/custom-island';
import { recordParams } from '@/lib/customization';
import IslandApp from '@/components/island-app';
import { DEMO } from '@/lib/demo';
import { appearanceFromRecord } from '@/lib/island';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  try {
    return (
      <IslandApp
        island={await getCustomIsland(DEMO, recordParams(query))}
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
