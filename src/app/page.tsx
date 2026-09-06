import IslandApp from '@/components/island-app';
import { DEMO } from '@/lib/demo';
import { appearanceFromRecord } from '@/lib/island';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <IslandApp island={DEMO} initialAppearance={appearanceFromRecord(await searchParams)} />;
}
