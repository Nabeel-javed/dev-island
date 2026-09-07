'use client';
import { ArrowRight, Code2, Compass, Star, X } from 'lucide-react';
import { compact, type Project } from '@/lib/island';
import { BUILDINGS, buildingFor } from '@/lib/buildings';
export default function ProjectPeek({
  project,
  entering,
  onEnter,
  onClose,
}: {
  project: Project | null;
  entering: boolean;
  onEnter: () => void;
  onClose: () => void;
}) {
  return (
    <section
      className={'project-peek' + (project ? ' has-project' : '')}
      aria-label="Project preview"
    >
      {project ? (
        <>
          <div className="peek-icon">
            <Code2 size={23} />
          </div>
          <div className="peek-copy">
            <span className="eyebrow">
              {BUILDINGS[buildingFor(project)].name} · {project.language || 'PROJECT'}
            </span>
            <h3>{project.name}</h3>
            <p>{project.description || 'Step inside to explore this public project.'}</p>
            <small>
              <Star size={12} />
              {compact(project.stars)} stars
            </small>
          </div>
          <button className="peek-enter" onClick={onEnter} disabled={entering}>
            Enter project <ArrowRight size={16} />
          </button>
          <button
            className="peek-close"
            aria-label="Close project preview"
            onClick={onClose}
            disabled={entering}
          >
            <X size={17} />
          </button>
        </>
      ) : (
        <>
          <Compass size={23} />
          <p>
            Pick a building to see what’s inside.
            <span>Hover, tap, or focus a project name. Your adventure starts there.</span>
          </p>
        </>
      )}
    </section>
  );
}
