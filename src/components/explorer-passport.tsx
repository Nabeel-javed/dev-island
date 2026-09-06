'use client';
import { ArrowUpRight, Check, Compass, Download, Stamp } from 'lucide-react';
import type { Island } from '@/lib/island';
import { PALETTES, type PaletteId, seed } from '@/lib/island';
import { passportComplete } from '@/lib/passport';
export default function ExplorerPassport({
  island,
  visited,
  persistent,
  palette,
  onSelect,
  onNotify,
}: {
  island: Island;
  visited: number[];
  persistent: boolean;
  palette: PaletteId;
  onSelect: (i: number) => void;
  onNotify: (message: string) => void;
}) {
  const complete = passportComplete(visited.length, island.projects.length);
  async function souvenir() {
    if (!complete) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 900;
      const c = canvas.getContext('2d');
      if (!c) throw new Error('Canvas unavailable');
      const p = PALETTES[palette];
      c.fillStyle = '#f8f5e8';
      c.fillRect(0, 0, 1200, 900);
      c.strokeStyle = p.accent;
      c.lineWidth = 3;
      c.strokeRect(28, 28, 1144, 844);
      c.fillStyle = p.accent;
      c.textAlign = 'center';
      c.font = '16px monospace';
      c.fillText('DEV ISLAND / EXPLORER PASSPORT', 600, 95);
      const fit = (value: string, width: number) => {
        let s = value;
        while (s.length && c.measureText(s).width > width) s = s.slice(0, -1);
        return s === value ? s : s.slice(0, -1) + '…';
      };
      c.font = 'bold 44px sans-serif';
      c.fillText(fit(`${island.name}’s island`, 1020), 600, 165);
      c.font = '22px sans-serif';
      c.fillStyle = '#748167';
      c.fillText(
        `Every room visited. ${island.projects.length} little stories discovered.`,
        600,
        210,
      );
      island.projects.forEach((project, i) => {
        const x = 240 + (i % 3) * 360,
          y = 350 + Math.floor(i / 3) * 220;
        c.save();
        c.translate(x, y);
        c.rotate((((seed(project.name) % 11) - 5) * Math.PI) / 180);
        c.strokeStyle = p.accent;
        c.fillStyle = p.accent;
        c.lineWidth = 2;
        c.beginPath();
        c.arc(0, 0, 78, 0, Math.PI * 2);
        c.stroke();
        c.setLineDash([3, 5]);
        c.beginPath();
        c.arc(0, 0, 70, 0, Math.PI * 2);
        c.stroke();
        c.setLineDash([]);
        c.font = '12px monospace';
        c.fillText('PROJECT ROOM', 0, -33);
        c.font = 'bold 32px sans-serif';
        c.fillText(String(i + 1).padStart(2, '0'), 0, 8);
        c.font = '12px monospace';
        c.fillText('VISITED', 0, 36);
        c.restore();
        c.fillStyle = '#52694c';
        c.font = '17px sans-serif';
        c.fillText(fit(project.name, 315), x, y + 107);
      });
      c.fillStyle = p.accent;
      c.font = 'bold 24px sans-serif';
      c.fillText('Your code could be a world of its own.', 600, 770);
      c.font = '17px sans-serif';
      c.fillText(window.location.host, 600, 807);
      if (island.source === 'demo') {
        c.fillStyle = '#89917f';
        c.font = '12px monospace';
        c.fillText('FICTIONAL SAMPLE ISLAND', 600, 839);
      }
      canvas.toBlob((blob) => {
        if (!blob) {
          onNotify('Could not export the souvenir. Please try again.');
          return;
        }
        const url = URL.createObjectURL(blob),
          link = document.createElement('a');
        link.href = url;
        link.download = `dev-island-${island.login}-passport.png`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        onNotify('Your exploration souvenir is ready.');
      }, 'image/png');
    } catch {
      onNotify('Souvenir export is unavailable in this browser.');
    }
  }
  return (
    <section
      className={'explorer-passport' + (complete ? ' passport-complete' : '')}
      aria-labelledby="explorer-passport-title"
    >
      <div className="explorer-passport-title">
        <Stamp size={17} />
        <h3 id="explorer-passport-title">Your exploration passport</h3>
      </div>
      <p>
        {complete
          ? 'Every room, a new discovery. Your passport is complete.'
          : island.projects.length
            ? 'Enter a room. Collect a stamp. Discover what’s being built.'
            : 'Your first stamp is waiting for a project to arrive.'}
      </p>
      {island.projects.length > 0 && (
        <>
          <div className="passport-stamp-grid">
            {island.projects.map((project, i) => (
              <button
                key={project.owner + '/' + project.name}
                className={visited.includes(i) ? 'stamp-earned' : ''}
                title={project.name}
                aria-label={`${visited.includes(i) ? 'Visited' : 'Visit'} ${project.name}`}
                onClick={() => onSelect(i)}
              >
                <span>
                  {visited.includes(i) ? <Check size={17} /> : String(i + 1).padStart(2, '0')}
                </span>
                <small>{project.name}</small>
              </button>
            ))}
          </div>
          <div className="passport-progress-label">
            <span>
              {visited.length} / {island.projects.length} stamps
            </span>
            <small>{persistent ? 'Saved in this browser' : 'Saved for this visit'}</small>
          </div>
          <progress
            max={island.projects.length}
            value={visited.length}
            aria-label="Project room stamps collected"
          />
        </>
      )}
      {complete && (
        <div className="passport-reward">
          <Compass size={24} />
          <strong>Island explorer</strong>
          <button onClick={souvenir}>
            <Download size={14} /> Download your souvenir
          </button>
          <a href="/#create">
            Create your own island <ArrowUpRight size={14} />
          </a>
        </div>
      )}
    </section>
  );
}
