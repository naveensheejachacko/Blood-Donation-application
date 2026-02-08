import { DonorCard } from './DonorCard.jsx';

export function DonorList({
  donors,
  status,
  error,
  onRetry,
  page = 1,
  pageSize = 12,
  totalCount = 0,
  onPageChange,
}) {
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

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return (
    <>
      <div className="donor-grid" data-count={donors.length}>
        {donors.map((donor) => (
          <DonorCard key={donor.id} donor={donor} />
        ))}
      </div>
      {totalPages > 1 && onPageChange && (
        <nav
          className="donors-pagination"
          aria-label="Donor list pagination"
        >
          <p className="donors-pagination-summary">
            Showing {from}–{to} of {totalCount}
          </p>
          <div className="donors-pagination-buttons">
            <button
              type="button"
              className="donors-pagination-button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="donors-pagination-page">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="donors-pagination-button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </>
  );
}

