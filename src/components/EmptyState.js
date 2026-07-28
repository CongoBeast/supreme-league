import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return <div className="empty-state">{Icon && <Icon size={34} className="mb-3" />}<h3 className="h5">{title}</h3><p className="muted mx-auto" style={{ maxWidth: 520 }}>{description}</p>{action}</div>;
}
