export type ProjectStory = { problem?: string; role?: string; outcome?: string };
export type StorySection = { heading: string; text: string };
// Only explicit author-written sections. Never infer personal responsibility or impact.
export function storyFromSections(sections: StorySection[]): ProjectStory {
  const story: ProjectStory = {};
  for (const section of sections) {
    const heading = section.heading
      .trim()
      .toLowerCase()
      .replace(/^[\d.\s]+/, '')
      .replace(/[:?!]$/, '');
    const field = /^(the problem|problem|motivation|why|why this project|problem statement)$/.test(
      heading,
    )
      ? 'problem'
      : /^(my role|my contribution|my contributions|my responsibilities)$/.test(heading)
        ? 'role'
        : /^(results|outcomes|outcome|impact|results and impact)$/.test(heading)
          ? 'outcome'
          : null;
    if (field && !story[field] && section.text.trim())
      story[field] = section.text.trim().slice(0, 900);
  }
  return story;
}
