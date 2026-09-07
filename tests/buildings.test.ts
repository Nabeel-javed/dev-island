import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUILDING_IDS, buildingFor, scenePalette, validBuilding } from '../src/lib/buildings';
import { DEMO } from '../src/lib/demo';
import { customizationURL, customizeIsland, readCustomization } from '../src/lib/customization';
import { readAppearance } from '../src/lib/island';
test('default building styles follow canonical repository identity rather than plot index', () => {
  for (const project of DEMO.projects) {
    assert.ok(BUILDING_IDS.includes(buildingFor(project)));
    assert.equal(
      buildingFor(project),
      buildingFor({
        ...project,
        owner: project.owner.toUpperCase(),
        name: project.name.toUpperCase(),
      }),
    );
  }
  assert.equal(validBuilding('__proto__'), false);
});
test('building styles survive selection reordering and a shared URL round trip', async () => {
  const selected = [
    { ...DEMO.projects[1], building: 'arcade' as const },
    { ...DEMO.projects[0], building: 'cafe' as const },
  ];
  const url = customizationURL('https://example.org/?lighting=night', selected, 'Welcome');
  const restored = await customizeIsland(DEMO, url.searchParams, async () => {
    throw new Error('Unexpected fetch');
  });
  assert.deepEqual(
    restored.projects.map((p) => p.building),
    ['arcade', 'cafe'],
  );
  assert.equal(readAppearance(url.searchParams).lighting, 'night');
  assert.equal(DEMO.projects[0].building, undefined);
});
test('malformed, duplicated and unbounded building style input is rejected', () => {
  for (const value of [
    'demo/moss-ui:__proto__',
    'demo/moss-ui:cafe,DEMO/MOSS-UI:arcade',
    'bad:cafe',
    'x'.repeat(1001),
  ])
    assert.throws(() => readCustomization(new URLSearchParams({ buildings: value })));
});
test('night is opt-in and preserves the chosen palette in day mode', () => {
  assert.equal(readAppearance(new URLSearchParams('lighting=invalid')).lighting, 'day');
  assert.notEqual(scenePalette('lagoon', 'night').water, scenePalette('lagoon', 'day').water);
  assert.notEqual(scenePalette('sunset', 'day').water, scenePalette('lagoon', 'day').water);
  assert.notEqual(scenePalette('sunset', 'night').water, scenePalette('lagoon', 'night').water);
});

test('README card and island destinations retain the same building and night settings', async () => {
  const { shareLinks } = await import('../src/lib/share');
  const appearance = {
    style: '3d' as const,
    palette: 'lavender' as const,
    avatar: 'sailor' as const,
    lighting: 'night' as const,
  };
  const links = shareLinks(
    'https://example.org',
    DEMO,
    appearance,
    new URLSearchParams('buildings=demo/moss-ui:cafe'),
  );
  for (const link of [links.page, links.card]) {
    assert.equal(new URL(link).searchParams.get('lighting'), 'night');
    assert.equal(new URL(link).searchParams.get('buildings'), 'demo/moss-ui:cafe');
  }
});
