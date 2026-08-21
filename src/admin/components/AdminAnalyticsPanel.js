import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { BarChart3, RefreshCw } from 'lucide-react';

import { adminApi, buildQuery, money } from '../adminApi';

const MONTHS_IN_RANGE = 30;

function toIsoDate(date) {
  return new Date(date).toISOString().slice(0, 10);
}


function defaultRange() {
  const today = new Date();
  return {
    from: toIsoDate(new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth() - (MONTHS_IN_RANGE - 1),
      1
    ))),
    to: toIsoDate(today),
  };
}

function compactNumber(value) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

function ChartFrame({ title, subtitle, children }) {
  return (
    <Card className="admin-card h-100">
      <Card.Header>
        <div className="d-flex align-items-center gap-2">
          <span className="admin-stat-icon admin-stat-icon-info">
            <BarChart3 size={18} />
          </span>
          <div>
            <h2 className="admin-card-title">{title}</h2>
            <div className="admin-card-subtitle">{subtitle}</div>
          </div>
        </div>
      </Card.Header>
      <Card.Body>{children}</Card.Body>
    </Card>
  );
}

function SingleSeriesChart({ data, valueKey, valueFormatter, label }) {
  const width = 900;
  const height = 300;
  const padding = { top: 24, right: 20, bottom: 54, left: 56 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const values = data.map((item) => Number(item[valueKey] || 0));
  const max = Math.max(...values, 1);

  const points = data.map((item, index) => {
    const x = data.length === 1
      ? padding.left + innerWidth / 2
      : padding.left + (index / (data.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - (Number(item[valueKey] || 0) / max) * innerHeight;
    return { x, y, value: Number(item[valueKey] || 0), item };
  });

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  const labelIndexes = data.length <= 8
    ? data.map((_, index) => index)
    : Array.from({ length: 6 }, (_, index) => Math.round((index * (data.length - 1)) / 5));

  return (
    <div className="admin-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={label}>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + innerHeight - ratio * innerHeight;
          return (
            <line
              key={ratio}
              x1={padding.left}
              x2={padding.left + innerWidth}
              y1={y}
              y2={y}
              stroke="currentColor"
              opacity="0.08"
            />
          );
        })}

        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="currentColor"
          >
            <title>{`${point.item.label}: ${valueFormatter(point.value)}`}</title>
          </circle>
        ))}

        {labelIndexes.map((index) => {
          const point = points[index];
          if (!point) return null;
          return (
            <text
              key={index}
              x={point.x}
              y={height - 18}
              textAnchor="middle"
              fontSize="11"
              fill="currentColor"
              opacity="0.65"
            >
              {point.item.label}
            </text>
          );
        })}
      </svg>
      <div className="admin-chart-caption">
        Peak: <strong>{valueFormatter(max)}</strong>
      </div>
    </div>
  );
}

function DualSeriesChart({ data }) {
  const width = 900;
  const height = 300;
  const padding = { top: 24, right: 20, bottom: 54, left: 68 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const values = data.flatMap((item) => [
    Number(item.cashInCents || 0),
    Number(item.revenueCents || 0),
  ]);
  const max = Math.max(...values, 1);

  const makePoints = (key) => data.map((item, index) => ({
    x: data.length === 1
      ? padding.left + innerWidth / 2
      : padding.left + (index / (data.length - 1)) * innerWidth,
    y: padding.top + innerHeight - (Number(item[key] || 0) / max) * innerHeight,
    value: Number(item[key] || 0),
    item,
  }));

  const cashPoints = makePoints('cashInCents');
  const revenuePoints = makePoints('revenueCents');

  const pathFor = (points) => points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  const labelIndexes = data.length <= 8
    ? data.map((_, index) => index)
    : Array.from({ length: 6 }, (_, index) => Math.round((index * (data.length - 1)) / 5));

  return (
    <div className="admin-chart-wrap">
      <div className="admin-chart-legend">
        <span><i className="admin-chart-dot admin-chart-dot-cash" /> Cash inflow</span>
        <span><i className="admin-chart-dot admin-chart-dot-revenue" /> Platform revenue</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Cash inflow and platform revenue">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + innerHeight - ratio * innerHeight;
          return (
            <line
              key={ratio}
              x1={padding.left}
              x2={padding.left + innerWidth}
              y1={y}
              y2={y}
              stroke="currentColor"
              opacity="0.08"
            />
          );
        })}

        <path d={pathFor(cashPoints)} fill="none" stroke="var(--admin-accent)" strokeWidth="4" strokeLinecap="round" />
        <path d={pathFor(revenuePoints)} fill="none" stroke="var(--admin-chart-secondary)" strokeWidth="4" strokeLinecap="round" />

        {cashPoints.map((point, index) => (
          <circle key={`cash-${index}`} cx={point.x} cy={point.y} r="3.5" fill="var(--admin-accent)">
            <title>{`${point.item.label}: ${money(point.value)} cash inflow`}</title>
          </circle>
        ))}
        {revenuePoints.map((point, index) => (
          <circle key={`revenue-${index}`} cx={point.x} cy={point.y} r="3.5" fill="var(--admin-chart-secondary)">
            <title>{`${point.item.label}: ${money(point.value)} revenue`}</title>
          </circle>
        ))}

        {labelIndexes.map((index) => {
          const point = cashPoints[index];
          if (!point) return null;
          return (
            <text
              key={index}
              x={point.x}
              y={height - 18}
              textAnchor="middle"
              fontSize="11"
              fill="currentColor"
              opacity="0.65"
            >
              {point.item.label}
            </text>
          );
        })}
      </svg>
      <div className="admin-chart-caption">
        Highest monthly value: <strong>{money(max)}</strong>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPanel({ refreshToken = 0 }) {
  const initialRange = useMemo(() => defaultRange(), []);
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [groupBy, setGroupBy] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError('');

    try {
      const query = buildQuery({
        from,
        to,
        groupBy,
        refresh: forceRefresh ? Date.now() : undefined,
      });
      const result = await adminApi(`/dashboard/analytics?${query}`);
      setData(result);
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(requestError.message || 'The dashboard analytics could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [from, to, groupBy]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (refreshToken > 0) load(true);
  }, [refreshToken, load]);

  const totals = data?.totals || {};
  const series = data?.series || [];

  return (
    <Card className="admin-card mt-4">
      <Card.Header>
        <div className="admin-analytics-header">
          <div>
            <div className="admin-eyebrow">Business analytics</div>
            <h2 className="admin-card-title admin-analytics-title">Sign-ups, cash inflows & revenue</h2>
            <div className="admin-card-subtitle">
              Default view covers the last 30 months. Cash inflow counts completed external Paynow/mock deposits,
              subscriptions and league entries; wallet-funded purchases are excluded to prevent double-counting.
            </div>
          </div>
          <Button
            type="button"
            variant="outline-dark"
            onClick={() => load(true)}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'admin-spin' : ''} />
            <span className="ms-2">{loading ? 'Refreshing…' : 'Refresh database'}</span>
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Row className="g-3 mb-4">
          <Col sm={6} xl={3}>
            <div className="admin-analytics-stat">
              <div className="admin-analytics-stat-label">Sign-ups — selected period</div>
              <div className="admin-analytics-stat-value">{compactNumber(totals.userSignups)}</div>
            </div>
          </Col>
          <Col sm={6} xl={3}>
            <div className="admin-analytics-stat">
              <div className="admin-analytics-stat-label">Cash inflow — selected period</div>
              <div className="admin-analytics-stat-value">{money(totals.cashInCents)}</div>
              <div className="admin-analytics-stat-detail">{compactNumber(totals.cashInCount)} completed transactions</div>
            </div>
          </Col>
          <Col sm={6} xl={3}>
            <div className="admin-analytics-stat">
              <div className="admin-analytics-stat-label">Revenue — selected period</div>
              <div className="admin-analytics-stat-value">{money(totals.revenueCents)}</div>
              <div className="admin-analytics-stat-detail">Selected date range</div>
            </div>
          </Col>
          <Col sm={6} xl={3}>
            <div className="admin-analytics-stat">
              <div className="admin-analytics-stat-label">All-time cash inflow</div>
              <div className="admin-analytics-stat-value">{money(totals.lifetimeCashInCents)}</div>
              <div className="admin-analytics-stat-detail">{compactNumber(totals.lifetimeCashInCount)} completed transactions</div>
            </div>
          </Col>
        </Row>

        <Card className="admin-filter-card mb-4">
          <Card.Body>
            <Row className="g-3 align-items-end">
              <Col sm={6} md={4}>
                <Form.Label className="admin-filter-label">From</Form.Label>
                <Form.Control type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
              </Col>
              <Col sm={6} md={4}>
                <Form.Label className="admin-filter-label">To</Form.Label>
                <Form.Control type="date" value={to} onChange={(event) => setTo(event.target.value)} />
              </Col>
              <Col sm={6} md={4}>
                <Form.Label className="admin-filter-label">Group by</Form.Label>
                <Form.Select value={groupBy} onChange={(event) => setGroupBy(event.target.value)}>
                  <option value="month">Month</option>
                  <option value="week">Week</option>
                  <option value="day">Day</option>
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {error && <div className="admin-state-alert alert alert-danger">{error}</div>}

        {loading && !data ? (
          <div className="admin-loading admin-loading-compact">
            <div className="spinner-border admin-loading-spinner" role="status" aria-hidden="true" />
            <div>
              <div className="admin-loading-title">Refreshing analytics</div>
              <div className="admin-loading-detail">Querying the latest records from the database.</div>
            </div>
          </div>
        ) : (
          <Row className="g-4">
            <Col xl={5}>
              <ChartFrame
                title="User sign-ups"
                subtitle="Registered customer accounts in the selected period."
              >
                <SingleSeriesChart
                  data={series}
                  valueKey="userSignups"
                  label="User sign-ups"
                  valueFormatter={(value) => compactNumber(value)}
                />
              </ChartFrame>
            </Col>
            <Col xl={7}>
              <ChartFrame
                title="Cash inflow & platform revenue"
                subtitle="Monthly comparison of external cash received and recorded platform revenue."
              >
                <DualSeriesChart data={series} />
              </ChartFrame>
            </Col>
          </Row>
        )}

        {lastUpdated && (
          <div className="admin-analytics-last-updated">
            Last database refresh: {lastUpdated.toLocaleString()}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
