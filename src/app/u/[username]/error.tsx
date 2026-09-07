'use client';
export default function IslandError({ reset }: { reset: () => void }) {
  return (
    <main className="island-error">
      <span className="eyebrow">A SHORT DETOUR</span>
      <h1>The island couldn’t arrive.</h1>
      <p>GitHub may be busy or temporarily unavailable. Your link is safe to try again.</p>
      <button className="studio-primary" onClick={reset}>
        Try again
      </button>
      <a href="/">Explore the sample island →</a>
    </main>
  );
}
