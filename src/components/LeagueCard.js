import React, { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import CurrencyAmount from './CurrencyAmount';
import StatusBadge from './StatusBadge';

export default function LeagueCard({ league, compact = false }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    if (!league.inviteCode) return;
    try {
      await navigator.clipboard.writeText(league.inviteCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Card className="league-card soft-card h-100">
      <Card.Body className="p-4 d-flex flex-column">
        <div className="d-flex justify-content-between gap-3 mb-3">
          <div>
            <div className="small text-brand fw-bold text-uppercase">
              {league.cadence || league.competitionType}
            </div>
            <h3 className="h5 mb-1">{league.name}</h3>
          </div>
          <StatusBadge status={league.isPast ? 'past' : league.status} />
        </div>

        {!compact && <p className="muted small">{league.description}</p>}

        {league.createdByCurrentUser && league.inviteCode && (
          <div className="border rounded p-3 mb-3">
            <div className="muted small">Your invitation code</div>
            <div className="d-flex justify-content-between align-items-center gap-2 mt-1">
              <strong className="letter-spacing">{league.inviteCode}</strong>
              <Button type="button" variant="outline-dark" size="sm" onClick={copyCode}>
                <Copy size={14} /> {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        )}

        <div className="row g-3 small mb-4">
          <div className="col-6">
            <div className="muted">Entry fee</div>
            <div className="fw-bold"><CurrencyAmount cents={league.entryFeeCents} /></div>
          </div>
          <div className="col-6">
            <div className="muted">Paid members</div>
            <div className="fw-bold">{league.participantCount}/{league.maximumParticipants}</div>
          </div>
          <div className="col-6">
            <div className="muted">Gameweeks</div>
            <div className="fw-bold">{league.startGameweek}–{league.endGameweek}</div>
          </div>
          <div className="col-6">
            <div className="muted">{league.isPast ? 'Ended' : 'Closes'}</div>
            <div className="fw-bold">
              {league.expiresAt ? new Date(league.expiresAt).toLocaleDateString('en-GB') : 'Not scheduled'}
            </div>
          </div>
          <div className="col-6">
            <div className="muted">Gross pool</div>
            <div className="fw-bold"><CurrencyAmount cents={league.grossPoolCents} /></div>
          </div>
          <div className="col-6">
            <div className="muted">Projected prize</div>
            <div className="fw-bold">
              <CurrencyAmount cents={league.projectedPrizeCents || league.displayedPrizeCents} />
            </div>
          </div>
          <div className="col-6">
            <div className="muted">Score through</div>
            <div className="fw-bold">{league.scoreThroughGameweek ? `GW ${league.scoreThroughGameweek}` : 'Not synced'}</div>
          </div>
          <div className="col-6">
            <div className="muted">Your payment</div>
            <div className="fw-bold text-capitalize">{league.entry?.paymentStatus || 'Not started'}</div>
          </div>
        </div>

        <Button
          as={Link}
          to={`/app/leagues/${league.id}`}
          variant={league.canPayEntry ? 'primary' : 'dark'}
          className="w-100 mt-auto"
        >
          {league.canPayEntry ? 'Complete payment' : league.isPast ? 'View past league' : 'View competition'}
        </Button>
      </Card.Body>
    </Card>
  );
}
