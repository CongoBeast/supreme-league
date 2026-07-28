import React from 'react';

export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-end mb-4">
      <div>
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h1 className="page-title h2 mb-1">{title}</h1>
        {description && <p className="muted mb-0">{description}</p>}
      </div>
      {actions && <div className="d-flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
