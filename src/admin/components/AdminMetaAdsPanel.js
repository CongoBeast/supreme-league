import { useEffect, useState } from 'react';
import { Alert, Card, Col, Row, Table } from 'react-bootstrap';
import { BadgeDollarSign, BarChart3, MousePointerClick, ReceiptText, UserPlus, UsersRound } from 'lucide-react';

import { adminApi } from '../adminApi';
import StatCard from './StatCard';

const number = (value) => new Intl.NumberFormat('en-GB').format(Number(value || 0));
const pct = (value) => `${Number(value || 0).toFixed(2)}%`;
const money = (cents, currency = 'USD') => new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(Number(cents || 0) / 100);

export default function AdminMetaAdsPanel({ refreshToken = 0 }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setError('');
    adminApi('/marketing/meta?days=30')
      .then((response) => { if (active) setData(response); })
      .catch((requestError) => { if (active) setError(requestError.message || 'Meta Ads metrics could not be loaded.'); });
    return () => { active = false; };
  }, [refreshToken]);

  return (
    <Card className="admin-card mt-4">
      <Card.Header>
        <div className="d-flex justify-content-between gap-3 flex-wrap align-items-start">
          <div>
            <div className="admin-card-kicker">Meta Ads · last 30 days</div>
            <h2 className="admin-card-title mb-1">Acquisition performance</h2>
            <div className="admin-card-subtitle">Ad spend from Meta matched against first-touch platform sign-ups and paying customers.</div>
          </div>
          {data?.range && <div className="small text-secondary">{data.range.since} → {data.range.until}</div>}
        </div>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="warning" className="mb-3"><strong>Meta reporting is not connected yet.</strong> {error}</Alert>}
        {data && (
          <>
            <Row className="g-3 mb-4">
              <Col sm={6} xl={4}><StatCard label="Ad spend" value={money(data.totals.spendCents, data.currency)} detail={`${number(data.totals.impressions)} impressions · ${pct(data.totals.ctr)} CTR`} icon={BadgeDollarSign} tone="warning" /></Col>
              <Col sm={6} xl={4}><StatCard label="Platform sign-ups" value={number(data.totals.signups)} detail={`${money(data.totals.costPerSignupCents, data.currency)} cost per signup`} icon={UserPlus} tone="primary" /></Col>
              <Col sm={6} xl={4}><StatCard label="Paid customers" value={number(data.totals.paidCustomers)} detail={`${money(data.totals.costPerPaidCustomerCents, data.currency)} acquisition cost`} icon={UsersRound} tone="success" /></Col>
              <Col sm={6} xl={4}><StatCard label="Ad clicks" value={number(data.totals.clicks)} detail={`${pct(data.totals.signupRateFromClicksPct)} click → signup`} icon={MousePointerClick} /></Col>
              <Col sm={6} xl={4}><StatCard label="Attributed revenue" value={money(data.totals.attributedRevenueCents, data.currency)} detail={`${data.totals.roas.toFixed(2)}x platform ROAS`} icon={ReceiptText} tone="success" /></Col>
              <Col sm={6} xl={4}><StatCard label="Meta registrations" value={number(data.totals.metaRegistrations)} detail="Meta-reported registration actions" icon={BarChart3} /></Col>
            </Row>

            <div className="table-responsive">
              <Table hover align="middle" className="mb-2">
                <thead><tr><th>Campaign</th><th className="text-end">Spend</th><th className="text-end">Clicks</th><th className="text-end">Sign-ups</th><th className="text-end">Cost/signup</th><th className="text-end">Paid</th><th className="text-end">Revenue</th><th className="text-end">ROAS</th></tr></thead>
                <tbody>
                  {data.campaigns.length ? data.campaigns.map((campaign) => (
                    <tr key={campaign.campaignId}>
                      <td><div className="fw-semibold">{campaign.campaignName}</div><div className="small text-secondary">{campaign.campaignId}</div></td>
                      <td className="text-end">{money(campaign.spendCents, data.currency)}</td>
                      <td className="text-end">{number(campaign.clicks)}</td>
                      <td className="text-end">{number(campaign.signups)}</td>
                      <td className="text-end">{campaign.signups ? money(campaign.costPerSignupCents, data.currency) : '—'}</td>
                      <td className="text-end">{number(campaign.paidCustomers)}</td>
                      <td className="text-end">{money(campaign.attributedRevenueCents, data.currency)}</td>
                      <td className="text-end">{campaign.roas ? `${campaign.roas.toFixed(2)}x` : '—'}</td>
                    </tr>
                  )) : <tr><td colSpan="8" className="text-center text-secondary py-4">No campaign spend was returned for this period.</td></tr>}
                </tbody>
              </Table>
            </div>
            <div className="small text-secondary">{data.attributionNote}</div>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
