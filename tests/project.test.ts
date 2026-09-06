import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderReadme, resolveReadmeUrl, README_LIMIT } from '../src/lib/readme';
import { validRepository } from '../src/lib/project';
import { createProjectCache, ProjectMemoryStore } from '../src/lib/project-cache';
import type { ProjectDetails } from '../src/lib/project';
import { FRESH_MS, STALE_MS } from '../src/lib/cache';
const base = 'https://github.com/person/repo/blob/main/docs/README.md';
test('README preserves readable content and strips executable HTML', async () => {
  const r = await renderReadme(
    '# Hello\n\nIntroduction.\n\n## Features\n- Works offline\n\n<script>alert(1)</script><iframe src="https://example.com"></iframe><img src="javascript:alert(1)" onerror="alert(1)">\n\n[unsafe](javascript:alert(1))\n\n| A | B |\n| - | - |\n| x | y |',
    base,
  );
  assert.match(r.html, /<table>/);
  assert.doesNotMatch(r.html, /<script|<iframe|onerror|javascript:/);
  assert.match(r.introduction, /Introduction/);
  assert.match(r.features, /Works offline/);
});
test('README resolves relative images, links and heading anchors', async () => {
  const r = await renderReadme(
    '# Hello World\n\n[go](#hello-world)\n\n![preview](images/a.png)\n\n<img src="../b.png" alt="Second">\n\n[source](../src/main.ts)',
    base,
  );
  assert.equal(
    r.images[0].src,
    'https://raw.githubusercontent.com/person/repo/main/docs/images/a.png',
  );
  assert.equal(r.images[1].src, 'https://raw.githubusercontent.com/person/repo/main/b.png');
  assert.match(r.html, /href="#user-content-hello-world"/);
  assert.match(r.html, /id="user-content-hello-world"/);
  assert.match(r.html, /target="_blank"/);
  assert.equal(resolveReadmeUrl('https://user:pass@example.com', base), undefined);
});
test('README caps content and gallery and excludes badges', async () => {
  const r = await renderReadme(
    '![badge](https://img.shields.io/a)\n' +
      Array.from({ length: 8 }, (_, i) => `![image](images/${i}.png)`).join('\n') +
      '\n' +
      'x'.repeat(README_LIMIT + 1),
    base,
  );
  assert.equal(r.truncated, true);
  assert.equal(r.images.length, 6);
});
test('repository segments cannot change API paths', () => {
  for (const s of ['hello.world', '.github', 'a-b_c']) assert.ok(validRepository(s));
  for (const s of ['', '.', '..', 'a/b', 'x?y', 'a'.repeat(101)]) assert.ok(!validRepository(s));
});
const value = {
  readme: { status: 'available' },
  languageStatus: 'available',
  name: 'test',
} as ProjectDetails;
test('project cache coalesces, serves stale on outage, expires and invalidates unavailable repos', async () => {
  let now = 0,
    calls = 0,
    fail = 0;
  const store = new ProjectMemoryStore();
  const cached = createProjectCache(
    store,
    async () => {
      calls++;
      await new Promise((r) => setTimeout(r, 5));
      if (fail) throw Object.assign(new Error('failure'), { status: fail });
      return value;
    },
    () => now,
  );
  await Promise.all([cached('Owner/Repo'), cached('owner/repo')]);
  assert.equal(calls, 1);
  now = FRESH_MS + 1;
  fail = 502;
  assert.match((await cached('owner/repo')).notice!, /snapshot/);
  now = STALE_MS + 1;
  await assert.rejects(cached('owner/repo'));
  now = FRESH_MS + 1;
  fail = 404;
  await assert.rejects(cached('owner/repo'));
  assert.equal(await store.get('owner/repo'), null);
});
