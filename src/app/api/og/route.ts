import { NextRequest } from 'next/server';
import { readAppearance, validUsername } from '@/lib/island';
import { getIsland, GitHubError } from '@/lib/github';
import { getCustomIsland } from '@/lib/custom-island';
import { projectKey } from '@/lib/project';
import { socialCard } from '@/lib/social-card';
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams,
    username = params.get('username') ?? 'demo';
  if (!validUsername(username)) return new Response('Invalid username', { status: 400 });
  try {
    const island = await getCustomIsland(await getIsland(username), params);
    const room = island.projects.find(
      (p) => projectKey(p.owner, p.name) === params.get('project')?.toLowerCase(),
    );
    const appearance = readAppearance(params);
    return socialCard(
      island.source === 'demo' ? 'demo' : island.login,
      appearance.palette,
      island,
      appearance.lighting,
      room,
    );
  } catch (error) {
    return new Response('This island preview is temporarily unavailable.', {
      status: error instanceof GitHubError ? error.status : 500,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
