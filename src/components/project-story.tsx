'use client';
import { useState } from 'react';
import { ArrowUpRight, BookOpen, Monitor, Star } from 'lucide-react';
import RepositoryOverview from './repository-overview';
import type { Project } from '@/lib/island';
import type { ProjectDetails } from '@/lib/project';
function StoryImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <p className="room-muted">This project image is currently unavailable.</p>
  ) : (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
export default function ProjectStory({
  project,
  details,
}: {
  project: Project;
  details: ProjectDetails | null;
}) {
  const readme = details?.readme,
    story = readme?.story,
    demo = project.owner === 'demo';
  const homepage = details?.homepage || project.homepage;
  return (
    <div className="project-story">
      <span className="eyebrow">THE PROJECT, AT A GLANCE</span>
      <h3>{project.name}</h3>
      <p className="story-purpose">
        {details?.description ||
          project.description ||
          readme?.introduction ||
          (details?.overview
            ? 'The author has not provided a repository description. See the file-based overview below.'
            : details
              ? 'There is not enough documentation to explain this project yet.'
              : 'Loading project information…')}
      </p>
      <div className="story-actions">
        {homepage && !demo && (
          <a className="studio-primary" href={homepage} target="_blank" rel="noopener noreferrer">
            <Monitor size={16} /> Try the demo <ArrowUpRight size={14} />
          </a>
        )}
        {!demo && (
          <a
            className="studio-secondary"
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub <ArrowUpRight size={14} />
          </a>
        )}
      </div>
      <div className="room-facts">
        <span>
          <Star size={14} />
          {(details?.stars ?? project.stars).toLocaleString()} stars
        </span>
        <span>{details?.license || 'License not specified'}</span>
        <span>
          Updated{' '}
          {new Date(details?.updatedAt || project.updatedAt).toLocaleDateString('en', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
      {details?.overview && <RepositoryOverview overview={details.overview} />}
      <div className="story-sections">
        {(
          [
            ['Why it exists', story?.problem],
            ['The author’s contribution', story?.role],
            ['Results & impact', story?.outcome],
          ] as const
        ).map(
          ([title, text]) =>
            text && (
              <section className="story-section" key={title}>
                <h4>{title}</h4>
                <p>{text}</p>
                <small>From the project README</small>
              </section>
            ),
        )}
        {readme?.introduction && (
          <section className="story-section">
            <h4>In the author’s words</h4>
            <p>{readme.introduction}</p>
            <small>README excerpt</small>
          </section>
        )}
        {readme?.features && (
          <section className="story-section">
            <h4>What you can do</h4>
            <p>{readme.features}</p>
            <small>README highlights</small>
          </section>
        )}
      </div>
      {!!readme?.images.length && (
        <section className="story-gallery">
          <h4>A closer look</h4>
          {readme.images.slice(0, 3).map((image) => (
            <figure key={image.src}>
              <StoryImage {...image} />
              <figcaption>{image.alt}</figcaption>
            </figure>
          ))}
        </section>
      )}
      {readme?.status === 'available' && readme.url && !demo && (
        <a className="room-link" href={readme.url} target="_blank" rel="noopener noreferrer">
          <BookOpen size={16} /> Read the source README <ArrowUpRight size={14} />
        </a>
      )}
    </div>
  );
}
