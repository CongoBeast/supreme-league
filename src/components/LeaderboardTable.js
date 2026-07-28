import React from 'react';
import { Table } from 'react-bootstrap';
import CurrencyAmount from './CurrencyAmount';
import ProfileAvatar from './ProfileAvatar';

export default function LeaderboardTable({ rows = [], earnings = false }) {
  return (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            {earnings ? (
              <>
                <th>Wins</th>
                <th className="text-end">Prize earnings</th>
              </>
            ) : (
              <>
                <th className="text-end">Score</th>
                <th className="text-end">Prize</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.userId || row.name}-${row.rank}`}
              className={row.isCurrentUser ? 'current-user-row' : ''}
            >
              <td><span className="leaderboard-medal">{row.rank}</span></td>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <ProfileAvatar src={row.profilePicture} name={row.name} size="sm" />
                  <div className="fw-semibold">{row.name}{row.isCurrentUser ? ' (You)' : ''}</div>
                </div>
              </td>
              {earnings ? (
                <>
                  <td>{row.wins || 0}</td>
                  <td className="text-end fw-bold"><CurrencyAmount cents={row.earningsCents} /></td>
                </>
              ) : (
                <>
                  <td className="text-end fw-bold">{row.score ?? 0}</td>
                  <td className="text-end"><CurrencyAmount cents={row.prizeCents || 0} /></td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
