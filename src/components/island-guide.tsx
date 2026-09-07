'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Compass, X } from 'lucide-react';
import type { Island } from '@/lib/island';
export function GuideCharacter() {
  return (
    <span className="guide-character" aria-hidden="true">
      <i className="guide-hat" />
      <i className="guide-head" />
      <i className="guide-coat" />
      <i className="guide-scarf" />
    </span>
  );
}
export default function IslandGuide({
  island,
  onStart,
  onOpenChange,
}: {
  island: Island;
  onStart: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false),
    dialog = useRef<HTMLDialogElement>(null);
  function changeOpen(value: boolean) {
    setOpen(value);
    onOpenChange(value);
  }
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  return (
    <>
      <button
        className="island-guide"
        onClick={() => changeOpen(true)}
        aria-label="Meet Pip, your island guide"
      >
        <GuideCharacter />
        <span>
          <strong>Hello, explorer.</strong>
          <small>
            Let me show you around <ArrowRight size={11} />
          </small>
        </span>
      </button>
      <dialog
        className="project-dialog guide-dialog"
        ref={dialog}
        aria-labelledby="guide-title"
        onCancel={() => changeOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) changeOpen(false);
        }}
      >
        <button
          className="dialog-close"
          aria-label="Close island guide"
          onClick={() => changeOpen(false)}
        >
          <X size={20} />
        </button>
        <div className="guide-introduction">
          <GuideCharacter />
          <span className="eyebrow">PIP · YOUR ISLAND GUIDE</span>
        </div>
        <h2 id="guide-title">Welcome to {island.name}’s island.</h2>
        <p>
          I’ll help you discover the projects that live here. Each building has a story, and each
          room earns you a stamp in your exploration passport.
        </p>
        {(island.customIntro || island.bio) && (
          <blockquote>
            <span>
              {island.customIntro ? 'WELCOME · CUSTOM VIEW' : 'FROM THE ISLAND’S PROFILE'}
            </span>
            {island.customIntro || island.bio}
          </blockquote>
        )}
        {island.projects.length ? (
          <>
            <div className="guide-route">
              <Compass size={19} />
              <span>
                A short tour · {Math.min(3, island.projects.length)} project{' '}
                {island.projects.length === 1 ? 'room' : 'rooms'}
                <small>Explore at your own pace. You can leave the tour at any time.</small>
              </span>
            </div>
            <button
              className="guide-start"
              onClick={() => {
                changeOpen(false);
                onStart();
              }}
            >
              Show me around <ArrowRight size={17} />
            </button>
          </>
        ) : (
          <p>
            There aren’t any project rooms here yet. The island is ready for its first public
            project.
          </p>
        )}
        <button className="guide-skip" onClick={() => changeOpen(false)}>
          I’ll explore on my own
        </button>
      </dialog>
    </>
  );
}
