import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Modal, Spinner } from 'react-bootstrap';
import {
  Activity,
  CalendarDays,
  BarChart3,
  RefreshCw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { api } from '../services/api';
import CurrencyAmount from './CurrencyAmount';
import ProfileAvatar from './ProfileAvatar';
import './user-public-profile-modal.css';

const number = (value) => (
  value === null || value === undefined || value === ''
    ? '—'
    : Number(value).toLocaleString('en-GB')
);

const date = (value, includeTime = false) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleString('en-GB', includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' });
};

function Metric({ icon: Icon, label, value, detail }) {
  return (
    <div className="public-player-metric">
      <div className="public-player-metric__icon"><Icon size={19} /></div>
      <div>
        <div className="public-player-metric__label">{label}</div>
        <div className="public-player-metric__value">{value}</div>
        {detail && <div className="public-player-metric__detail">{detail}</div>}
      </div>
    </div>
  );
}

export default function UserPublicProfileModal({
  show,
  onHide,
  userId,
  initialName = 'Supreme player',
  initialPicture = '',
}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    setProfile(null);
    try {
      const response = await api(`/api/users/${encodeURIComponent(userId)}/public-profile`);
      setProfile(response.profile);
    } catch (requestError) {
      setError(requestError.message || 'The player profile could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (show && userId) load();
  }, [show, userId, load]);

  const close = () => {
    setProfile(null);
    setError('');
    onHide();
  };

  const displayName = profile?.name || initialName;
  const displayPicture = profile?.profilePicture || initialPicture;
  const fpl = profile?.fpl || {};

  return (
    <Modal
      show={show}
      onHide={close}
      centered
      size="lg"
      contentClassName="public-player-modal"
      aria-labelledby="public-player-modal-title"
    >
      <Modal.Header closeButton className="public-player-modal__header">
        <Modal.Title id="public-player-modal-title" className="visually-hidden">
          {displayName} player profile
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        {loading && (
          <div className="public-player-loading" role="status" aria-live="polite">
            <div className="public-player-loading__orb">
              <Spinner animation="border" size="sm" />
            </div>
            <h2 className="h5 mb-1">Loading player profile</h2>
            <p className="mb-0">Fetching wins and the latest FPL statistics…</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-4 p-md-5">
            <Alert variant="danger" className="mb-3">{error}</Alert>
            <Button variant="outline-dark" onClick={load}>
              <RefreshCw size={16} /> Try again
            </Button>
          </div>
        )}

        {!loading && !error && profile && (
          <>
            <section className="public-player-hero">
              <div className="public-player-hero__glow" aria-hidden="true" />
              <div className="public-player-identity">
                <ProfileAvatar
                  src={displayPicture}
                  name={displayName}
                  size="lg"
                  className="public-player-avatar"
                />
                <div className="min-width-0">
                  <div className="public-player-kicker"><Sparkles size={15} /> Supreme player</div>
                  <h2 className="public-player-name">{displayName}</h2>
                  <p className="public-player-team mb-0">
                    {profile.fantasyTeamName || (fpl.linked ? 'Linked FPL manager' : 'No linked FPL team')}
                  </p>
                </div>
              </div>

              <div className="public-player-hero__facts">
                <div>
                  <span>Prize earnings</span>
                  <strong><CurrencyAmount cents={profile.prizeEarningsCents || 0} /></strong>
                </div>
                <div>
                  <span>Member since</span>
                  <strong>{date(profile.memberSince)}</strong>
                </div>
              </div>
            </section>

            <section className="public-player-body">
              <div className="public-player-metrics-grid">
                <Metric
                  icon={Trophy}
                  label="Competition wins"
                  value={number(profile.wins)}
                  detail={profile.lastWinAt ? `Latest win ${date(profile.lastWinAt)}` : 'No completed wins recorded yet'}
                />
                <Metric
                  icon={BarChart3}
                  label="FPL overall rank"
                  value={number(fpl.overallRank)}
                  detail={fpl.hasSnapshot ? 'Latest synchronised ranking' : 'Team data has not been synchronised'}
                />
                <Metric
                  icon={Activity}
                  label={`Gameweek${fpl.gameweek ? ` ${fpl.gameweek}` : ''} points`}
                  value={number(fpl.gameweekPoints)}
                  detail={fpl.gameweekRank ? `Gameweek rank ${number(fpl.gameweekRank)}` : 'Latest gameweek performance'}
                />
                <Metric
                  icon={Sparkles}
                  label="Total FPL points"
                  value={number(fpl.totalPoints)}
                  detail="Current season total"
                />
              </div>

              <div className="public-player-sync-strip">
                <CalendarDays size={18} />
                <div>
                  <strong>{fpl.hasSnapshot ? 'Latest FPL snapshot' : 'FPL statistics unavailable'}</strong>
                  <span>
                    {fpl.hasSnapshot
                      ? `Last synchronised ${date(fpl.lastSyncedAt, true)}`
                      : fpl.linked
                        ? 'The manager ID is linked, but no successful team snapshot is stored yet.'
                        : 'This member has not linked an FPL manager ID.'}
                  </span>
                </div>
              </div>
            </section>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
