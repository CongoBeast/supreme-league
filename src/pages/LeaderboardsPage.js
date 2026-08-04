import React, { useEffect, useState } from 'react';
import { Alert, Tab, Tabs } from 'react-bootstrap';
import { Trophy } from 'lucide-react';
import { api } from '../services/api';
import PageHeader from '../components/PageHeader';
import LeaderboardTable from '../components/LeaderboardTable';
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
      <div className="d-flex flex-wrap justify-content-between gap-2 small muted mb-3">
        <span>{board.leagueName || board.name}</span>
        <span>
          {board.scoreThroughGameweek ? `Scored through Gameweek ${board.scoreThroughGameweek}` : 'Awaiting first score sync'}
        </span>
      </div>
      <LeaderboardTable rows={board.rows} />
    </>
  );
}

export default function LeaderboardsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      setData(await api('/api/leaderboards'));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <LoadingScreen fullScreen={false} label="Loading leaderboards" />;

  return (
    <>
      <PageHeader
        eyebrow="Rankings"
        title="Leaderboards"
        description="Competition standings use qualifying paid entries and official score records. Wins and prize earnings appear only after completed settlement transactions."
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
