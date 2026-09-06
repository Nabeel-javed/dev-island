import { NextRequest } from 'next/server';
import { readAppearance, validUsername } from '@/lib/island';
import { socialCard } from '@/lib/social-card';
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams,
    username = params.get('username') ?? 'demo';
  if (!validUsername(username)) return new Response('Invalid username', { status: 400 });
  return socialCard(username, readAppearance(params).palette);
}
