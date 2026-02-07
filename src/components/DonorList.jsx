import { DonorCard } from './DonorCard.jsx';

export function DonorList({ donors, status, error, onRetry }) {
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="donors-state">
        <p className="donors-state-text">Loading donors…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="donors-state donors-state-error">
        <p className="donors-state-text">
          We could not load the donor list right now.
        </p>
        {error ? (
          <p className="donors-state-text donors-state-technical">
            Details for maintainers: {error}
          </p>
        ) : null}
        <button
          type="button"
          className="retry-button"
          onClick={() => onRetry?.()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (donors.length === 0) {
    return (
      <div className="donors-state donors-state-empty">
        <p className="donors-state-text">
          No donors found. Try adjusting the filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="donor-grid" data-count={donors.length}>
      {donors.map((donor) => (
        <DonorCard key={donor.id} donor={donor} />
      ))}
    </div>
  );
}

