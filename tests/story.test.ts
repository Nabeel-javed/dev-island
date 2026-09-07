import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderReadme } from '../src/lib/readme';
import { storyFromSections } from '../src/lib/story';
test('project stories preserve explicit author claims after other README sections', async () => {
  const readme = await renderReadme(
    '# App\n\nA tool for notes.\n\n## Features\n\n- Search\n\n## Problem\n\nNotes are hard to find.\n\n## My role\n\nI built the search interface.\n\n## Results\n\nOur team uses it every week.',
    'https://github.com/example/app/blob/main/README.md',
  );
  assert.deepEqual(readme.story, {
    problem: 'Notes are hard to find.',
    role: 'I built the search interface.',
    outcome: 'Our team uses it every week.',
  });
  assert.equal(readme.features, 'Search');
});
test('project stories do not infer authorship or outcomes from unrelated sections', () => {
  assert.deepEqual(
    storyFromSections([
      { heading: 'Contributors', text: 'Many people helped' },
      { heading: 'Installation', text: 'npm install' },
      { heading: 'Features', text: 'Fast results' },
    ]),
    {},
  );
});
test('long story excerpts are bounded and retain the first explicit source', () => {
  const story = storyFromSections([
    { heading: 'Impact', text: 'x'.repeat(2000) },
    { heading: 'Results', text: 'later claim' },
  ]);
  assert.equal(story.outcome?.length, 900);
});
