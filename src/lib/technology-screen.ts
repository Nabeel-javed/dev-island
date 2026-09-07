import type { ProjectDetails } from './project';
export type TechnologyExhibit = Pick<
  ProjectDetails,
  'name' | 'languages' | 'languageStatus' | 'source'
>;
export function paintTechnologyScreen(c: CanvasRenderingContext2D, exhibit?: TechnologyExhibit) {
  c.fillStyle = '#142c2d';
  c.fillRect(0, 0, 512, 320);
  c.fillStyle = '#254548';
  c.fillRect(0, 0, 512, 48);
  for (let i = 0; i < 3; i++) {
    c.fillStyle = ['#d09277', '#d7bb77', '#96b697'][i];
    c.fillRect(18 + i * 18, 19, 8, 8);
  }
  c.textAlign = 'left';
  c.fillStyle = '#ebeddb';
  c.font = '16px monospace';
  const label = exhibit?.name || 'Repository';
  c.fillText(label.length > 28 ? label.slice(0, 27) + '…' : label, 90, 31);
  c.font = '13px monospace';
  c.fillStyle = '#9cbab5';
  c.fillText(
    exhibit?.source === 'demo' ? 'SAMPLE LANGUAGE BREAKDOWN' : 'REPOSITORY LANGUAGES',
    22,
    76,
  );
  const languages =
    exhibit?.languageStatus === 'available'
      ? exhibit.languages.filter((l) => Number.isFinite(l.bytes) && l.bytes > 0)
      : [];
  const total = languages.reduce((n, l) => n + l.bytes, 0);
  const colors = ['#89c3b0', '#b4b7dd', '#d6bf84', '#9db895'];
  if (total > 0)
    languages.slice(0, 4).forEach((l, i) => {
      const y = 107 + i * 42;
      c.fillStyle = '#e1e9d8';
      c.font = '15px monospace';
      c.fillText(l.name.slice(0, 27), 22, y);
      c.textAlign = 'right';
      c.fillText(`${Math.round((l.bytes / total) * 100)}%`, 490, y);
      c.textAlign = 'left';
      c.fillStyle = '#2b4847';
      c.fillRect(22, y + 9, 468, 7);
      c.fillStyle = colors[i];
      c.fillRect(22, y + 9, Math.max(1, (468 * l.bytes) / total), 7);
    });
  else {
    c.fillStyle = '#b9cec0';
    c.font = '16px monospace';
    c.fillText(exhibit ? 'Language data unavailable' : 'Loading repository…', 22, 139);
  }
  c.fillStyle = '#7d9f98';
  c.font = '12px monospace';
  c.fillText(
    total > 0
      ? 'By source bytes · open Technology for details'
      : 'Open Technology to inspect project details',
    22,
    301,
  );
}
