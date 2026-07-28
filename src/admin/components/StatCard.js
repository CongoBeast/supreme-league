import { Card } from 'react-bootstrap';

export default function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'primary',
}) {
  return (
    <Card className="admin-stat-card h-100 border-0">
      <Card.Body>
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div>
            <div className="admin-stat-label">{label}</div>
            <div className="admin-stat-value">{value}</div>
            {detail && <div className="admin-stat-detail">{detail}</div>}
          </div>
          {Icon && (
            <span className={`admin-stat-icon admin-stat-icon-${tone}`}>
              <Icon size={21} />
            </span>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
