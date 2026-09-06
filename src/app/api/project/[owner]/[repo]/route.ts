import { NextResponse } from 'next/server';
import { getProject } from '@/lib/project-data';
import { GitHubError } from '@/lib/github';
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> },
) {
  try {
    const { owner, repo } = await params;
    return NextResponse.json(await getProject(owner, repo), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    const status = error instanceof GitHubError ? error.status : 500;
    console.warn(JSON.stringify({ event: 'project_failed', status }));
    return NextResponse.json(
      {
        error:
          error instanceof GitHubError
            ? error.message
            : 'This project could not be loaded. Please try again.',
      },
      { status, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
