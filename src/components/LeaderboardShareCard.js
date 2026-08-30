import React from 'react';
import { Button } from 'react-bootstrap';
import { Download, Share2 } from 'lucide-react';

function chipLabel(row) {
  return row.activeChipLabel || 'No chip';
}

function transferLabel(row) {
  const transfers = Number(row.transfers || 0);
  const cost = Number(row.transferCost || 0);
  if (!transfers) return '0';
  return cost > 0 ? `${transfers} (-${cost})` : `${transfers}`;
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildSvg({ title, subtitle, rows }) {
  const width = 1200;
  const rowHeight = 86;
  const height = 250 + (rows.length * rowHeight);
  const renderedRows = rows.map((row, index) => {
    const y = 180 + (index * rowHeight);
    return `
      <rect x="36" y="${y - 28}" width="1128" height="72" rx="20" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
      <text x="64" y="${y + 14}" font-size="34" fill="#f8fafc" font-weight="700">${escapeXml(row.rank)}</text>
      <text x="130" y="${y - 2}" font-size="28" fill="#f8fafc" font-weight="700">${escapeXml(row.name)}</text>
      <text x="130" y="${y + 28}" font-size="20" fill="#94a3b8">${escapeXml(row.teamName || row.managerName || '')}</text>
      <text x="620" y="${y - 2}" font-size="28" fill="#f8fafc" font-weight="700" text-anchor="end">${escapeXml(row.score ?? 0)} pts</text>
      <text x="820" y="${y - 2}" font-size="22" fill="#cbd5e1" text-anchor="end">Left ${escapeXml(row.playersRemainingLabel || '—')}</text>
      <text x="1010" y="${y - 2}" font-size="22" fill="#cbd5e1" text-anchor="end">${escapeXml(chipLabel(row))}</text>
      <text x="1130" y="${y - 2}" font-size="22" fill="#cbd5e1" text-anchor="end">Trf ${escapeXml(transferLabel(row))}</text>
    `;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#111827" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" rx="32" />
      <text x="36" y="64" font-size="26" fill="#38bdf8" font-weight="700">SUPREME FANTASY LEAGUE</text>
      <text x="36" y="110" font-size="44" fill="#f8fafc" font-weight="800">${escapeXml(title)}</text>
      <text x="36" y="145" font-size="22" fill="#94a3b8">${escapeXml(subtitle)}</text>
      <text x="36" y="205" font-size="18" fill="#64748b">Rank</text>
      <text x="130" y="205" font-size="18" fill="#64748b">Player</text>
      <text x="620" y="205" font-size="18" fill="#64748b" text-anchor="end">Points</text>
      <text x="820" y="205" font-size="18" fill="#64748b" text-anchor="end">Players left</text>
      <text x="1010" y="205" font-size="18" fill="#64748b" text-anchor="end">Chip</text>
      <text x="1130" y="205" font-size="18" fill="#64748b" text-anchor="end">Transfers</text>
      ${renderedRows}
      <text x="36" y="${height - 24}" font-size="16" fill="#64748b">Top 5 • Players left is based on each participant’s most recently synced 15-player squad and unfinished fixtures.</text>
    </svg>
  `;
}

async function downloadShareImage({ title, subtitle, rows, fileName }) {
  const svg = buildSvg({ title, subtitle, rows });
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = new Image();
    img.decoding = 'async';
    const loadPromise = new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });
    img.src = url;
    await loadPromise;

    const width = img.width || 1200;
    const height = img.height || 700;
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);

    const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (pngBlob) {
      triggerDownload(pngBlob, `${fileName}.png`);
    } else {
      triggerDownload(svgBlob, `${fileName}.svg`);
    }
  } catch {
    triggerDownload(svgBlob, `${fileName}.svg`);
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export default function LeaderboardShareCard({ title, subtitle = '', rows = [] }) {
  const topRows = rows.slice(0, 5);
  if (!topRows.length) return null;

  const handleDownload = () => {
    const safeTitle = String(title || 'leaderboard')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'leaderboard';
    downloadShareImage({
      title,
      subtitle,
      rows: topRows,
      fileName: `${safeTitle}-top-5`,
    });
  };

  return (
    <div className="surface-card p-4 mb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
        <div>
          <div className="small text-uppercase muted fw-semibold mb-1">Share card</div>
          <h3 className="h5 mb-1">Top 5 leaderboard card</h3>
          <div className="small muted">Includes points, players left, chip usage and transfers for easy sharing.</div>
        </div>
        <Button variant="dark" onClick={handleDownload}>
          <Download size={16} className="me-2" /> Download image
        </Button>
      </div>

      <div className="rounded-4 p-3" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #111827 100%)', color: '#f8fafc' }}>
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
          <div>
            <div className="small text-uppercase fw-semibold" style={{ color: '#38bdf8', letterSpacing: '0.08em' }}>
              <Share2 size={14} className="me-2" /> Supreme Fantasy League
            </div>
            <div className="h4 mb-1 mt-2">{title}</div>
            <div className="small" style={{ color: '#94a3b8' }}>{subtitle}</div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-borderless align-middle mb-0" style={{ color: '#f8fafc' }}>
            <thead>
              <tr style={{ color: '#94a3b8' }}>
                <th>#</th>
                <th>Player</th>
                <th className="text-end">Pts</th>
                <th className="text-end">Left</th>
                <th className="text-end">Chip</th>
                <th className="text-end">Trf</th>
              </tr>
            </thead>
            <tbody>
              {topRows.map((row) => (
                <tr key={`${row.userId || row.name}-${row.rank}`}>
                  <td className="fw-bold">{row.rank}</td>
                  <td>
                    <div className="fw-semibold">{row.name}</div>
                    <div className="small" style={{ color: '#94a3b8' }}>{row.teamName || row.managerName || 'Supreme player'}</div>
                  </td>
                  <td className="text-end fw-bold">{row.score ?? 0}</td>
                  <td className="text-end">{row.playersRemainingLabel || '—'}</td>
                  <td className="text-end">{chipLabel(row)}</td>
                  <td className="text-end">{transferLabel(row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="small mt-3" style={{ color: '#94a3b8' }}>
          Players left is calculated from the participant’s synced 15-player squad and unfinished fixtures.
        </div>
      </div>
    </div>
  );
}
