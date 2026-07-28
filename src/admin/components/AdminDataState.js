import { Alert, Button, Spinner } from 'react-bootstrap';
import { AlertTriangle, Inbox } from 'lucide-react';

export function AdminLoading({
  message = 'Loading data…',
  detail = 'Please wait while the latest information is fetched.',
  compact = false,
}) {
  return (
    <div className={compact ? 'admin-loading admin-loading-compact' : 'admin-loading'}>
      <Spinner animation="border" role="status" className="admin-loading-spinner">
        <span className="visually-hidden">{message}</span>
      </Spinner>
      <div>
        <div className="admin-loading-title">{message}</div>
        {!compact && <div className="admin-loading-detail">{detail}</div>}
      </div>
    </div>
  );
}

export function AdminError({
  message = 'The requested data could not be loaded.',
  onRetry,
}) {
  return (
    <Alert variant="danger" className="admin-state-alert">
      <div className="d-flex align-items-start gap-3">
        <AlertTriangle size={22} className="flex-shrink-0 mt-1" />
        <div className="flex-grow-1">
          <div className="fw-semibold">Something went wrong</div>
          <div>{message}</div>
          {onRetry && (
            <Button variant="outline-danger" size="sm" className="mt-3" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

export function AdminEmpty({
  title = 'No records found',
  message = 'Try changing your search or filter options.',
}) {
  return (
    <div className="admin-empty-state">
      <span className="admin-empty-icon">
        <Inbox size={24} />
      </span>
      <div className="fw-semibold">{title}</div>
      <div className="text-secondary small">{message}</div>
    </div>
  );
}
