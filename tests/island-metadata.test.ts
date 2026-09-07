import { test } from 'node:test';
import assert from 'node:assert/strict';
import { islandMetadata } from '../src/lib/island-metadata';
import { DEMO } from '../src/lib/demo';
test('personal previews retain appearance and customization and identify the selected room', () => {
  const params = new URLSearchParams(
    'style=3d&palette=lavender&lighting=night&projects=demo/moss-ui&buildings=demo/moss-ui:library&project=demo/moss-ui&unrelated=discard',
  );
  const result = islandMetadata(DEMO, params);
  assert.match(String(result.title), /moss-ui/);
  const image = (result.openGraph?.images as { url: string }[])[0].url;
  const parsed = new URL(image, 'https://example.com');
  for (const key of ['style', 'palette', 'lighting', 'projects', 'buildings', 'project'])
    assert.equal(parsed.searchParams.get(key), params.get(key));
  assert.equal(parsed.searchParams.has('unrelated'), false);
});
test('an unavailable room does not become a misleading project preview', () => {
  const result = islandMetadata(DEMO, new URLSearchParams('project=demo/not-here'));
  assert.doesNotMatch(String(result.title), /not-here/);
  assert.doesNotMatch((result.openGraph?.images as { url: string }[])[0].url, /project=/);
});
