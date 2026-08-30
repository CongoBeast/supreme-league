import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import { Info } from 'lucide-react';
import CurrencyAmount from './CurrencyAmount';
import ProfileAvatar from './ProfileAvatar';
import UserPublicProfileModal from './UserPublicProfileModal';

function transferLabel(row) {
  if (row.transfers == null) return '—';
  const transfers = Number(row.transfers || 0);
  const cost = Number(row.transferCost || 0);
  return cost > 0 ? `${transfers} (-${cost})` : `${transfers}`;
}

export default function LeaderboardTable({ rows = [], earnings = false }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const openPlayer = (row) => {
    if (!row.userId) return;
    setSelectedPlayer({ userId: String(row.userId), name: row.name, profilePicture: row.profilePicture || '' });
  };

  return <>
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle">
        <thead><tr><th>Rank</th><th>Player</th>{earnings ? <><th>Wins</th><th className="text-end">Prize earnings</th></> : <><th className="text-end">Points</th><th className="text-end">Chip</th><th className="text-end">Transfers</th><th className="text-end">Prize</th></>}</tr></thead>
        <tbody>{rows.map((row) => <tr key={`${row.userId || row.name}-${row.rank}`} className={row.isCurrentUser ? 'current-user-row' : ''}>
          <td><span className="leaderboard-medal">{row.rank}</span></td>
          <td><div className="d-flex align-items-center gap-2">
            {row.userId ? <button type="button" className="leaderboard-player-trigger" onClick={() => openPlayer(row)} aria-label={`View ${row.name}'s player profile`}><ProfileAvatar src={row.profilePicture} name={row.name} size="sm" /><div className="text-start"><div className="fw-semibold text-truncate">{row.name}{row.isCurrentUser ? ' (You)' : ''}</div>{!earnings && row.teamName ? <div className="small muted text-truncate">{row.teamName}</div> : null}</div></button> : <div className="d-flex align-items-center gap-2"><ProfileAvatar src={row.profilePicture} name={row.name} size="sm" /><div className="fw-semibold">{row.name}</div></div>}
            {row.userId && <button type="button" className="leaderboard-profile-info" onClick={() => openPlayer(row)} aria-label={`More information about ${row.name}`} title="View player information"><Info size={16} /></button>}
          </div></td>
          {earnings ? <><td>{row.wins || 0}</td><td className="text-end fw-bold"><CurrencyAmount cents={row.earningsCents} /></td></> : <><td className="text-end fw-bold">{row.score ?? 0}</td><td className="text-end">{row.activeChipLabel || '—'}</td><td className="text-end">{transferLabel(row)}</td><td className="text-end"><CurrencyAmount cents={row.prizeCents || 0} /></td></>}
        </tr>)}</tbody>
      </Table>
    </div>
    <UserPublicProfileModal show={Boolean(selectedPlayer)} onHide={() => setSelectedPlayer(null)} userId={selectedPlayer?.userId || ''} initialName={selectedPlayer?.name || 'Supreme player'} initialPicture={selectedPlayer?.profilePicture || ''} />
  </>;
}
