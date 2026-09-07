'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { BUILDINGS, BUILDING_IDS, buildingFor, type BuildingId } from '@/lib/buildings';
import type { Island, Project } from '@/lib/island';
import { projectKey, validRepository, type ProjectDetails } from '@/lib/project';
import { customizationURL } from '@/lib/customization';
export default function IslandEditor({ island, onClose }: { island: Island; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null),
    request = useRef<AbortController | null>(null);
  const [projects, setProjects] = useState(island.projects),
    [intro, setIntro] = useState(island.customIntro ?? '');
  const [repo, setRepo] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    dialog.current?.showModal();
    return () => request.current?.abort();
  }, []);
  const candidates = (island.defaultProjects ?? island.projects).filter(
    (p) =>
      !projects.some(
        (selected) => projectKey(selected.owner, selected.name) === projectKey(p.owner, p.name),
      ),
  );
  function move(index: number, direction: number) {
    const next = [...projects];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    setProjects(next);
  }
  async function add(event: React.FormEvent) {
    event.preventDefault();
    const name = repo.trim();
    if (!validRepository(name)) {
      setError('Enter a repository name, such as my-project.');
      return;
    }
    if (projects.length >= 6) {
      setError('Remove a building before adding another. Six fit on this island.');
      return;
    }
    if (projects.some((p) => projectKey(p.owner, p.name) === projectKey(island.login, name))) {
      setError('That project is already on this island.');
      return;
    }
    setBusy(true);
    setError('');
    request.current?.abort();
    const abort = new AbortController();
    request.current = abort;
    try {
      const response = await fetch(
        `/api/project/${encodeURIComponent(island.login)}/${encodeURIComponent(name)}`,
        { signal: abort.signal },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'This public project could not load.');
      const p = data as ProjectDetails;
      if (p.owner.toLowerCase() !== island.login.toLowerCase())
        throw new Error('Choose a public repository owned by this profile.');
      const project: Project = {
        ...p,
        id: projectKey(p.owner, p.name),
        language: p.languages[0]?.name ?? '',
      };
      setProjects((previous) =>
        previous.length >= 6 ||
        previous.some(
          (existing) => projectKey(existing.owner, existing.name) === projectKey(p.owner, p.name),
        )
          ? previous
          : [...previous, project],
      );
      setRepo('');
    } catch (error) {
      if (!abort.signal.aborted)
        setError(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      if (!abort.signal.aborted) setBusy(false);
    }
  }
  return (
    <dialog
      className="project-dialog studio-dialog"
      ref={dialog}
      aria-labelledby="editor-title"
      onCancel={onClose}
    >
      <button className="dialog-close" aria-label="Close island editor" onClick={onClose}>
        <X size={20} />
      </button>
      <span className="eyebrow">MAKE ROOM FOR YOUR BEST WORK</span>
      <h2 id="editor-title">Arrange your island.</h2>
      <p>
        Choose up to six public projects, pick a building style for each, and write a welcome. Your
        changes live in a shareable link.
      </p>
      <label className="studio-label" htmlFor="island-intro">
        Welcome message <span>{intro.length}/240</span>
      </label>
      <textarea
        id="island-intro"
        maxLength={240}
        rows={3}
        value={intro}
        onChange={(e) => setIntro(e.target.value)}
        placeholder="Welcome! Start with my latest project…"
      />
      <h3 className="studio-label">Featured buildings · {projects.length}/6</h3>
      <ol className="editor-buildings">
        {projects.map((project, i) => (
          <li key={projectKey(project.owner, project.name)}>
            <span className="editor-number">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <strong>{project.name}</strong>
              <small>
                {project.owner}/{project.name}
              </small>
            </div>
            <label className="editor-building-style">
              <span className="sr-only">Building style for {project.name}</span>
              <select
                value={buildingFor(project)}
                disabled={busy}
                onChange={(e) =>
                  setProjects(
                    projects.map((p, j) =>
                      j === i ? { ...p, building: e.target.value as BuildingId } : p,
                    ),
                  )
                }
              >
                {BUILDING_IDS.map((id) => (
                  <option key={id} value={id}>
                    {BUILDINGS[id].name}
                  </option>
                ))}
              </select>
            </label>
            <button
              disabled={i === 0 || busy}
              aria-label={`Move ${project.name} earlier`}
              onClick={() => move(i, -1)}
            >
              <ArrowUp size={16} />
            </button>
            <button
              disabled={i === projects.length - 1 || busy}
              aria-label={`Move ${project.name} later`}
              onClick={() => move(i, 1)}
            >
              <ArrowDown size={16} />
            </button>
            <button
              disabled={busy}
              aria-label={`Remove ${project.name}`}
              onClick={() => setProjects(projects.filter((_, j) => i !== j))}
            >
              <X size={16} />
            </button>
          </li>
        ))}
      </ol>
      {!projects.length && (
        <p>No buildings selected. Add a project below to open your first room.</p>
      )}
      {candidates.length > 0 && (
        <div className="editor-candidates">
          <span className="studio-label">Available projects</span>
          {candidates.map((project) => (
            <button
              className="studio-secondary"
              key={project.id}
              disabled={projects.length >= 6 || busy}
              onClick={() => setProjects([...projects, project])}
            >
              <Plus size={13} />
              {project.name}
            </button>
          ))}
        </div>
      )}
      {island.source !== 'demo' && (
        <form onSubmit={add}>
          <label className="studio-label" htmlFor="add-repository">
            Add another public repository from @{island.login}
          </label>
          <div className="editor-add">
            <input
              id="add-repository"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              maxLength={100}
              placeholder="repository-name"
              disabled={busy || projects.length >= 6}
            />
            <button className="studio-secondary" disabled={busy || projects.length >= 6}>
              {busy ? 'Loading…' : 'Add project'}
            </button>
          </div>
        </form>
      )}
      {error && <p role="alert">{error}</p>}
      <div className="studio-actions">
        <button
          className="studio-primary"
          disabled={busy}
          onClick={() => {
            window.location.href = customizationURL(window.location.href, projects, intro).href;
          }}
        >
          Apply & view island
        </button>
        <button
          className="studio-secondary"
          disabled={busy}
          onClick={() => {
            const url = new URL(window.location.href);
            for (const key of ['projects', 'intro', 'project', 'buildings'])
              url.searchParams.delete(key);
            url.hash = 'explore';
            window.location.href = url.href;
          }}
        >
          Restore default island
        </button>
      </div>
      <p className="studio-note">
        Anyone can arrange a shared view. It will be labeled “Custom view”; the GitHub profile stays
        unchanged. Copy the island link after applying to keep or share your version.
      </p>
    </dialog>
  );
}
