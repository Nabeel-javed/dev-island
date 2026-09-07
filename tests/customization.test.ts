import { test } from 'node:test';
import assert from 'node:assert/strict';
import { customizeIsland, customizationURL, readCustomization } from '../src/lib/customization';
import { DEMO } from '../src/lib/demo';
import type { ProjectDetails } from '../src/lib/project';
const noFetch = async (): Promise<ProjectDetails> => {
  throw new Error('Unexpected request');
};
test('custom layouts reorder featured buildings without mutating the canonical island', async () => {
  const island = await customizeIsland(
    DEMO,
    new URLSearchParams('projects=demo/dotfiles,demo/moss-ui,demo/dotfiles&intro=Welcome'),
    noFetch,
  );
  assert.deepEqual(
    island.projects.map((p) => p.name),
    ['dotfiles', 'moss-ui'],
  );
  assert.equal(DEMO.projects[0].name, 'moss-ui');
  assert.equal(island.customIntro, 'Welcome');
  assert.equal(island.customView, true);
  assert.equal(island.defaultProjects?.length, 6);
});
test('custom layouts validate all project identities and length before fetching', async () => {
  assert.throws(() => readCustomization(new URLSearchParams('projects=../../secret')));
  assert.throws(() => readCustomization(new URLSearchParams({ intro: 'a'.repeat(241) })));
  const island = { ...DEMO, source: 'github' as const, login: 'octocat', projects: [] };
  await assert.rejects(
    customizeIsland(island, new URLSearchParams('projects=octocat/ok,other/no'), noFetch),
    /owned by this profile/,
  );
  assert.deepEqual(readCustomization(new URLSearchParams('projects=')).projects, []);
});
test('new public projects must still belong to the profile after loading', async () => {
  const island = { ...DEMO, source: 'github' as const, login: 'octocat', projects: [] };
  await assert.rejects(
    customizeIsland(
      island,
      new URLSearchParams('projects=octocat/moved'),
      async () => ({ owner: 'other' }) as ProjectDetails,
    ),
    /no longer belongs/,
  );
});
test('custom links preserve appearance, remove current room, and round trip introduction text', () => {
  const url = customizationURL(
    'https://example.org/u/octocat?style=3d&project=demo/moss-ui',
    DEMO.projects.slice(0, 1),
    'Hello & welcome #1',
  );
  assert.equal(url.searchParams.get('style'), '3d');
  assert.equal(url.searchParams.has('project'), false);
  assert.equal(readCustomization(url.searchParams).introduction, 'Hello & welcome #1');
});
