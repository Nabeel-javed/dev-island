import { getCustomIsland } from '@/lib/custom-island';
import { NextRequest } from 'next/server';
import { getIsland, GitHubError } from '@/lib/github';
import { DEMO } from '@/lib/demo';
import { readAppearance, validUsername } from '@/lib/island';
import { socialCard } from '@/lib/social-card';
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const username = params.get('username') ?? 'demo';
  if (!validUsername(username)) return new Response('Invalid username', { status: 400 });
  try {
    const island = username === 'demo' ? DEMO : await getIsland(username);
    return socialCard(
      username,
      readAppearance(params).palette,
      await getCustomIsland(island, params),
    );
  } catch (error) {
    return new Response('This island card is unavailable. Please try again later.', {
      status: error instanceof GitHubError ? error.status : 500,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
