export default function NotFound() {
  return (
    <main className="island-error">
      <span className="eyebrow">ISLAND NOT FOUND</span>
      <h1>That island is off the map.</h1>
      <p>
        Check the GitHub username and the projects in this link. Only public personal profiles are
        supported.
      </p>
      <a href="/">Find another island →</a>
    </main>
  );
}
