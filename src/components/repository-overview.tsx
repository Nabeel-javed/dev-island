import { FileSearch, ArrowUpRight } from 'lucide-react';
import type { RepositoryOverview as Overview } from '@/lib/repository-overview';
export default function RepositoryOverview({ overview }: { overview: Overview }) {
  return (
    <section className="repository-overview">
      <div className="repository-overview-heading">
        <FileSearch size={19} />
        <h4>What the files tell us</h4>
      </div>
      <span className="repository-evidence-label">
        {overview.status === 'unavailable'
          ? 'Inspection unavailable'
          : overview.inference
            ? 'Likely project type · inferred'
            : 'Purpose not established'}
      </span>
      <p>{overview.summary}</p>
      {overview.evidence.length > 0 && (
        <>
          <h5>Observed in the repository</h5>
          <ul>
            {overview.evidence.map((item, i) => (
              <li key={item.path + i}>
                <p>{item.fact}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.path}
                  <ArrowUpRight size={12} />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      {overview.status === 'partial' && (
        <p className="room-muted">
          Some files could not be inspected, or exceeded the inspection limits.
        </p>
      )}
      <details>
        <summary>How this overview was made</summary>
        <p>{overview.limitations}</p>
        <p>
          No repository code was run. This overview does not replace the author’s documentation.
        </p>
      </details>
    </section>
  );
}
