import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shareLinks } from '../src/lib/share';
import { DEMO } from '../src/lib/demo';
test('README links preserve appearance and customization but omit room and unrelated parameters', () => {
  const links = shareLinks(
    'https://example.org',
    { ...DEMO, source: 'github', login: 'octocat' },
    { style: '3d', palette: 'sunset', avatar: 'sailor' },
    new URLSearchParams(
      'project=octocat/Hello-World&projects=hello-world&intro=Hello+world&token=secret',
    ),
  );
  assert.equal(new URL(links.page).pathname, '/u/octocat');
  assert.equal(new URL(links.page).searchParams.get('intro'), 'Hello world');
  assert.equal(new URL(links.card).searchParams.get('palette'), 'sunset');
  assert.ok(!links.markdown.includes('token='));
  assert.ok(!links.markdown.includes('project='));
});
