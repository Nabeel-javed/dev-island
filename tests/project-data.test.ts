import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchPublicProject, getProject } from '../src/lib/project-data';
import { GitHubError } from '../src/lib/github';
const repo = {
  owner: { login: 'owner' },
  name: 'repo',
  html_url: 'https://github.com/owner/repo',
  stargazers_count: 1,
  updated_at: '2026-09-01',
  topics: [],
};
test('a missing README and empty language list keep a public project available', async () => {
  const p = await fetchPublicProject('owner/repo', async (path) => {
    if (path.endsWith('/readme')) throw new GitHubError('missing', 404);
    if (path.endsWith('/languages')) return {};
    return repo;
  });
  assert.equal(p.readme.status, 'missing');
  assert.equal(p.languageStatus, 'available');
  assert.deepEqual(p.languages, []);
});
test('a failed optional section does not discard the successful sections', async () => {
  const p = await fetchPublicProject('owner/repo', async (path) => {
    if (path.endsWith('/readme'))
      return {
        encoding: 'base64',
        content: Buffer.from('# Project\n\nReal description.').toString('base64'),
        html_url: repo.html_url + '/blob/main/README.md',
      };
    if (path.endsWith('/languages')) throw new GitHubError('rate limit', 429);
    return repo;
  });
  assert.equal(p.readme.status, 'available');
  assert.match(p.readme.introduction, /Real description/);
  assert.equal(p.languageStatus, 'unavailable');
});
test('private repositories are rejected before contents are requested', async () => {
  let calls = 0;
  await assert.rejects(
    fetchPublicProject('owner/repo', async () => {
      calls++;
      return { ...repo, private: true };
    }),
    { status: 404 },
  );
  assert.equal(calls, 1);
});
test('sample project details are complete without external requests', async () => {
  const p = await getProject('demo', 'moss-ui');
  assert.equal(p.source, 'demo');
  assert.match(p.readme.html, /<table>/);
  assert.equal(p.readme.images.length, 1);
});

test('missing README and description trigger inspection and retain source-linked overview', async () => {
  const p = await fetchPublicProject('owner/repo', async (path) => {
    if (path.endsWith('/readme')) throw new GitHubError('missing', 404);
    if (path.endsWith('/languages')) return { HTML: 120 };
    if (path.includes('/contents?')) return [{ path: 'index.html', type: 'file', size: 120 }];
    return { ...repo, default_branch: 'main' };
  });
  assert.equal(p.readme.status, 'missing');
  assert.match(p.overview!.summary, /static website/);
  assert.equal(p.overview!.inference, true);
});
