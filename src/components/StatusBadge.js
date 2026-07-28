import React from 'react';

export default function StatusBadge({ status = 'unknown' }) {
  return <span className={`status-badge ${String(status).toLowerCase().replace(/\s+/g, '-')}`}>{status}</span>;
}
