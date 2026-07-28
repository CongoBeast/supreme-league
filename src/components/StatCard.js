import React from 'react';

export default function StatCard({ icon: Icon, label, value, note }) {
  return (
    <div className="stat-card">
      <div className="d-flex justify-content-between align-items-start gap-3">
        <div>
          <div className="muted small fw-semibold mb-2">{label}</div>
          <div className="metric-number">{value}</div>
          {note && <div className="small muted mt-1">{note}</div>}
        </div>
        {Icon && <div className="stat-icon"><Icon size={20} /></div>}
      </div>
    </div>
  );
}
