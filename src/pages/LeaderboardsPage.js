import React, { useEffect, useState } from 'react';
import { Alert, Tab, Tabs } from 'react-bootstrap';
import { Trophy } from 'lucide-react';
import { api } from '../services/api';
import PageHeader from '../components/PageHeader';
import LeaderboardTable from '../components/LeaderboardTable';
import LeaderboardShareCard from '../components/LeaderboardShareCard';
import LoadingScreen from '../components/LoadingScreen';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

function CompetitionBoard({ board }) {
  if (!board.rows.length) {
    return (
      <EmptyState
        icon={Trophy}
        title={`No ${board.name} standings yet`}
        description="Standings appear after qualifying paid entries receive their first official score sync."
      />
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div className="small muted"><div>{board.leagueName || board.name}</div><div>{board.scoreThroughGameweek ? `Scored through Gameweek ${board.scoreThroughGameweek}` : 'Awaiting first score sync'}</div></div>
        <LeaderboardShareCard leagueId={board.leagueId} title={board.leagueName || board.name} disabled={!board.rows.length} />
      </div>
      <LeaderboardTable rows={board.rows} />
    </>
  );
}

export default function LeaderboardsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = async ({ refresh = false, background = false } = {}) => {
    if (!background) setError('');
    try {
      const response = await api(`/api/leaderboards${refresh ? '?refresh=1' : ''}`);
      setData(response);
      return response;
    } catch (requestError) {
      if (!background) setError(requestError.message);
      return null;
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const initial = await load();
      if (active && initial) load({ refresh: true, background: true });
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <LoadingScreen fullScreen={false} label="Loading leaderboards" />;

  return (
    <>
      <PageHeader
        eyebrow="Rankings"
        title="Leaderboards"
        description="Saved standings appear immediately; FPL score refresh runs automatically after the page is visible. Wins and prize earnings appear only after completed settlement transactions."
      />
      <Alert variant="light" className="border">
        <Trophy size={18} className="me-2" />
        Every displayed win is backed by a completed settlement and prize transaction recorded by the platform.
      </Alert>
      <div className="surface-card p-4">
        <Tabs defaultActiveKey="earnings" className="mb-3">
          <Tab eventKey="earnings" title="Most Wins & Earnings">
            {data.earnings.length ? (
              <LeaderboardTable rows={data.earnings} earnings />
            ) : (
              <EmptyState
                icon={Trophy}
                title="No completed winners yet"
                description="Completed prize transactions will appear here with each user's win count and total prize earnings."
              />
            )}
          </Tab>
          {data.competitions.map((board) => (
            <Tab key={board.key} eventKey={board.key} title={board.name}>
              <CompetitionBoard board={board} />
            </Tab>
          ))}
        </Tabs>
      </div>
    </>
  );
}
