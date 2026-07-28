import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AdminPageHeader({
  eyebrow = 'Administration',
  title,
  description,
  actions,
  backTo,
  backLabel = 'Back',
}) {
  return (
    <div className="admin-page-header">
      <div className="admin-page-heading-wrap">
        {backTo && (
          <Link className="admin-back-link" to={backTo}>
            <ArrowLeft size={16} />
            {backLabel}
          </Link>
        )}
        <div className="admin-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="admin-page-actions">{actions}</div>}
    </div>
  );
}
