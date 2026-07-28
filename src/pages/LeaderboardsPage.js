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
        description="This table is populated only from paid league members and stored FPL score syncs. No demo players are added."
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
  if (!data) return <LoadingScreen fullScreen={false} label="Loading database leaderboards" />;

  return (
    <>
      <PageHeader
        eyebrow="Rankings"
        title="Leaderboards"
        description="Rankings are read from MongoDB. Competition scores come from paid league entries, while wins and prize earnings come from completed prize transactions."
      />
      <Alert variant="light" className="border">
        <Trophy size={18} className="me-2" />
        No placeholder players are shown. A win appears only after a completed prize transaction is recorded for the winner.
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
