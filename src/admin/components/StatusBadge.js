import { Badge } from 'react-bootstrap';
import { humanize } from '../adminApi';

const toneByStatus = {
  active: 'success',
  open: 'success',
  completed: 'success',
  settled: 'success',
  resolved: 'success',
  eligible: 'success',
  live: 'primary',
  processing: 'primary',
  'in-progress': 'primary',
  upcoming: 'info',
  full: 'info',
  pending: 'warning',
  urgent: 'danger',
  high: 'warning',
  normal: 'primary',
  low: 'secondary',
  'pending-payment': 'warning',
  'awaiting-review': 'warning',
  'waiting-user': 'warning',
  warning: 'warning',
  suspended: 'danger',
  cancelled: 'danger',
  failed: 'danger',
  closed: 'secondary',
  draft: 'secondary',
  expired: 'secondary',
  ineligible: 'danger',
};

export default function StatusBadge({ value }) {
  return (
    <Badge bg={toneByStatus[value] || 'secondary'} className="admin-status-badge">
      {humanize(value)}
    </Badge>
  );
}
