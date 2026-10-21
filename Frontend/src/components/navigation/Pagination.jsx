import { PAGE_SIZE } from '../../utils/catalog';

export function Pagination({ page, setPage, count }) {
  const pages = Math.ceil(count / PAGE_SIZE);
  if (pages <= 1) return null;
  return (
    <nav className="pagination">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>
        ← Previous
      </button>
      <span>
        Page {page} of {pages}
      </span>
      <button disabled={page === pages} onClick={() => setPage(page + 1)}>
        Next →
      </button>
    </nav>
  );
}
