import React from 'react';

export default function LoadingScreen({ fullScreen = true, label = 'Loading Supreme Fantasy League' }) {
  if (!fullScreen) return <div className="py-5 text-center"><div className="spinner-border text-brand" role="status" /><div className="muted mt-3">{label}</div></div>;
  return <div className="loading-screen"><div className="text-center"><div className="loading-pulse mx-auto mb-3" /><div className="sfl-brand h4">Supreme Fantasy League</div><div className="text-white-50 small">{label}</div></div></div>;
}
