import { Pagination } from 'react-bootstrap';

export default function AdminPagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages, total } = pagination;

  return (
    <div className="admin-pagination-wrap">
      <div className="small text-secondary">
        Page {page} of {pages} · {total} records
      </div>
      <Pagination className="mb-0">
        <Pagination.First disabled={page <= 1} onClick={() => onPageChange(1)} />
        <Pagination.Prev disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
        <Pagination.Item active>{page}</Pagination.Item>
        <Pagination.Next disabled={page >= pages} onClick={() => onPageChange(page + 1)} />
        <Pagination.Last disabled={page >= pages} onClick={() => onPageChange(pages)} />
      </Pagination>
    </div>
  );
}
