'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Search, X } from 'lucide-react';
import type { Project } from '@/lib/island';
import { findProjects } from '@/lib/project-finder';
import { BUILDINGS, buildingFor } from '@/lib/buildings';
export default function ProjectFinder({
  projects,
  visited,
  onSelect,
  onOpenChange,
}: {
  projects: Project[];
  visited: number[];
  onSelect: (index: number) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(''),
    [language, setLanguage] = useState(''),
    [unvisited, setUnvisited] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const results = findProjects(projects, query, language, unvisited, visited);
  const languages = [...new Set(projects.map((p) => p.language).filter(Boolean))].sort();
  function close() {
    dialog.current?.close();
    setOpen(false);
    onOpenChange(false);
    trigger.current?.focus();
  }
  useEffect(() => {
    if (open) dialog.current?.showModal();
  }, [open]);
  return (
    <>
      <button
        ref={trigger}
        className="lighting-icon"
        title="Find a project"
        aria-label="Find a project"
        onClick={() => {
          setOpen(true);
          onOpenChange(true);
        }}
      >
        <Search size={18} />
      </button>
      <dialog
        ref={dialog}
        className="finder-dialog"
        aria-labelledby="finder-title"
        onCancel={(e) => {
          e.preventDefault();
          e.stopPropagation();
          close();
        }}
        onKeyDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="finder-heading">
          <div>
            <span className="eyebrow">EXPLORE THIS ISLAND</span>
            <h2 id="finder-title">Find your next stop.</h2>
          </div>
          <button aria-label="Close project finder" onClick={close}>
            <X size={20} />
          </button>
        </div>
        <label className="sr-only" htmlFor="project-search">
          Search projects
        </label>
        <div className="finder-search">
          <Search size={18} />
          <input
            id="project-search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Project name, language, or idea…"
            maxLength={200}
          />
        </div>
        <div className="finder-filters">
          <label>
            Language{' '}
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="">All languages</option>
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={unvisited}
              onChange={(e) => setUnvisited(e.target.checked)}
            />{' '}
            Not visited yet
          </label>
        </div>
        <p className="finder-count" role="status">
          {results.length} {results.length === 1 ? 'project' : 'projects'} found
        </p>
        <div className="finder-results">
          {results.map(({ project, index }) => (
            <button
              key={project.id}
              className="finder-result"
              onClick={() => {
                close();
                onSelect(index);
              }}
            >
              <span
                className="finder-building"
                style={{ background: BUILDINGS[buildingFor(project)].roof }}
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span>
                <strong>{project.name}</strong>
                <small>
                  {project.description || 'Explore the files and project overview inside.'}
                </small>
                <em>
                  {project.language || 'Language not listed'} ·{' '}
                  {BUILDINGS[buildingFor(project)].name}
                  {visited.includes(index) && (
                    <>
                      {' '}
                      · <Check size={11} /> Visited
                    </>
                  )}
                </em>
              </span>
              <ArrowUpRight size={18} />
            </button>
          ))}
          {!results.length && (
            <div className="finder-empty">
              <p>
                {projects.length
                  ? 'No matching stops. Try a different search or clear your filters.'
                  : 'This island has no featured projects yet.'}
              </p>
              {projects.length > 0 && (
                <button
                  onClick={() => {
                    setQuery('');
                    setLanguage('');
                    setUnvisited(false);
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
