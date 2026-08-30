import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Download } from 'lucide-react';
import { API_BASE } from '../services/api';

export default function LeaderboardShareCard({ leagueId, title, disabled = false }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!leagueId || downloading || disabled) return;
    setDownloading(true);
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
          // ignore json parse failure for non-json file responses
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const fileName = match?.[1] || `${String(title || 'leaderboard').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-top-5.svg`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      window.alert(error.message || 'The leaderboard image could not be generated.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="d-flex justify-content-end mb-3">
      <Button variant="dark" onClick={handleDownload} disabled={!leagueId || downloading || disabled}>
        <Download size={16} className="me-2" />
        {downloading ? 'Generating image…' : 'Download Top 5 image'}
      </Button>
    </div>
  );
}
