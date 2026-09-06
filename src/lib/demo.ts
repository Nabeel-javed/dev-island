import { Island, seed } from './island';
const names = [
  'moss-ui',
  'little-weather',
  'canvas-notes',
  'good-first-issue',
  'soundscape',
  'dotfiles',
];
const descriptions = [
  'Thoughtful components for the small, beautiful web. Accessible by default, a little playful by design.',
  'A quieter way to check the weather. Local forecasts, gentle animations, and absolutely no noise.',
  'An infinite canvas for the ideas that don’t fit in a text box. Draw, write, and connect the dots.',
  'Helping new contributors find their first home in open source. Small steps, meaningful contributions.',
  'Make room for focus. Mix rain, ocean waves, and woodland sounds into your own little escape.',
  'The tools, shortcuts, and tiny comforts that make a terminal feel like home.',
];
const days = Array.from({ length: 364 }, (_, i) => ({
  date: new Date(Date.UTC(2025, 8, 7 + i)).toISOString().slice(0, 10),
  count: seed('garden-' + i) % 5 === 0 ? 0 : seed('contribution-' + i) % 12,
}));
export const DEMO: Island = {
  login: 'demo',
  name: 'Alex Morgan',
  bio: 'Building thoughtful things for the web. A little code, a little curiosity, a lot of coffee.',
  location: 'Somewhere by the sea',
  followers: 248,
  projects: names.map((name, i) => ({
    id: name,
    name,
    description: descriptions[i],
    language: ['TypeScript', 'JavaScript', 'TypeScript', 'Python', 'TypeScript', 'Shell'][i],
    stars: [1280, 342, 218, 186, 94, 42][i],
    url: 'https://github.com',
    updatedAt: '2026-09-01T12:00:00Z',
  })),
  contributions: days,
  totalContributions: days.reduce((s, d) => s + d.count, 0),
  source: 'demo',
  updatedAt: '2026-09-06T00:00:00Z',
};
