'use client';
import { useEffect, useRef, useState } from 'react';
import { Copy, X } from 'lucide-react';
import type { Island, PaletteId, StyleId, AvatarId } from '@/lib/island';
import type { LightingId } from '@/lib/buildings';
import { shareLinks } from '@/lib/share';
export default function ProfileCard({
  island,
  palette,
  lighting = 'day',
  style,
  avatar,
  onClose,
}: {
  island: Island;
  palette: PaletteId;
  lighting?: LightingId;
  style: StyleId;
  avatar: AvatarId;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [links, setLinks] = useState<ReturnType<typeof shareLinks> | null>(null);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setLinks(
      shareLinks(
        window.location.origin,
        island,
        { palette, style, avatar, lighting },
        new URLSearchParams(window.location.search),
      ),
    );
    dialog.current?.showModal();
  }, [island, palette, style, avatar, lighting]);
  return (
    <dialog
      className="project-dialog studio-dialog"
      ref={dialog}
      aria-labelledby="card-title"
      onCancel={onClose}
    >
      <button className="dialog-close" aria-label="Close profile card" onClick={onClose}>
        <X size={20} />
      </button>
      <span className="eyebrow">A LITTLE WORLD ON YOUR GITHUB</span>
      <h2 id="card-title">Give your profile a front door.</h2>
      <p>
        Add this illustrated island card to your profile README. Clicking it opens your playable
        island.
      </p>
      {links && (
        <>
          {failed ? (
            <p role="alert">
              The preview couldn’t load. You can still copy the Markdown and try again later.
            </p>
          ) : (
            <img
              className="profile-card-preview"
              src={links.card}
              alt={`Illustrated profile card for ${island.login}'s island`}
              onError={() => setFailed(true)}
            />
          )}
          <label className="studio-label" htmlFor="profile-markdown">
            GitHub README Markdown
          </label>
          <textarea
            id="profile-markdown"
            readOnly
            value={links.markdown}
            rows={4}
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            className="studio-primary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(links.markdown);
                setMessage('Markdown copied. Paste it into your profile README.');
              } catch {
                setMessage('Select the Markdown above and copy it manually.');
              }
            }}
          >
            <Copy size={15} /> Copy Markdown
          </button>
          <p className="studio-note">
            Paste into README.md in your{' '}
            {island.source === 'demo' ? 'username/username' : `${island.login}/${island.login}`}{' '}
            repository, then commit it on GitHub.
            {island.source === 'demo'
              ? ' This is the sample card; generate your own island first for a personal card.'
              : ''}
          </p>
        </>
      )}
      <p role="status">{message}</p>
    </dialog>
  );
}
