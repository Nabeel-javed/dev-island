import { appearanceFromRecord } from '@/lib/island';
import type { Metadata } from 'next';
import IslandApp from '@/components/island-app';
import { getIsland, GitHubError } from '@/lib/github';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    openGraph: { images: [`/api/og?username=${encodeURIComponent(username)}`] },
    twitter: {
      card: 'summary_large_image',
      images: [`/api/og?username=${encodeURIComponent(username)}`],
    },
    title: `${username}’s island — Dev Island`,
    description: 'Explore the projects and little discoveries on this playable GitHub island.',
  };
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { username } = await params;
  try {
    return (
      <IslandApp
        key={username}
        island={await getIsland(username)}
        initialAppearance={appearanceFromRecord(await searchParams)}
      />
    );
  } catch (error) {
    return (
      <main style={{ padding: '100px 30px', maxWidth: 650 }}>
        <h1>This island is out of sight.</h1>
        <p>{error instanceof GitHubError ? error.message : 'Please try again shortly.'}</p>
        <a href="/" style={{ display: 'inline-block', marginTop: 30, textDecoration: 'underline' }}>
          Back to the archipelago →
        </a>
      </main>
    );
  }
}
