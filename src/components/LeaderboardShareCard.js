import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Download } from 'lucide-react';
import { API_BASE } from '../services/api';

export default function LeaderboardShareCard({ leagueId, title = 'Leaderboard', disabled = false }) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (!leagueId || busy || disabled) return;
    setBusy(true);
    try {
      const response = await fetch(`${API_BASE}/api/leagues/${leagueId}/leaderboard-card`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        let message = 'The leaderboard image could not be generated.';
        try {
          const payload = await response.json();
          message = payload?.message || message;
        } catch {
          // The image endpoint normally returns SVG rather than JSON.
        }
        throw new Error(message);
      }
      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const fallback = `${String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'leaderboard'}-top-5.svg`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = match?.[1] || fallback;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      window.alert(error.message || 'The leaderboard image could not be generated.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline-dark" onClick={download} disabled={!leagueId || disabled || busy}>
      <Download size={16} /> {busy ? 'Generating…' : 'Download Top 5 image'}
    </Button>
  );
}
