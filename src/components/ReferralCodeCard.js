import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Spinner } from 'react-bootstrap';
import { Check, Copy, Gift, Share2, Users } from 'lucide-react';
import { api } from '../services/api';

const formatMoney = (amountCents, currency = 'USD') =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format((amountCents || 0) / 100);

export default function ReferralCodeCard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    api('/api/referrals/me')
      .then(setData)
      .catch((requestError) => setError(requestError.message || 'Unable to load your referral code.'));
  }, []);

  const copy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1800);
    } catch {
      setError('Copying is not supported by this browser. Select and copy the code manually.');
    }
  };

  if (error && !data) return <Alert variant="danger">{error}</Alert>;
  if (!data) return <Card className="sfl-referral-card"><Card.Body className="d-flex align-items-center gap-2"><Spinner size="sm" /> Loading your referral details…</Card.Body></Card>;

  return (
    <Card className="sfl-referral-card border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
          <div>
            <div className="sfl-kicker"><Gift size={15} /> Referral rewards</div>
            <h2 className="h4 mt-2 mb-1">Invite friends and earn</h2>
            <p className="text-muted mb-0">
              You receive {formatMoney(data.rewardPerQualifiedReferralCents, data.currency)} after each referred member completes their first eligible purchase.
            </p>
          </div>
          <div className="sfl-referral-code-wrap">
            <span className="sfl-referral-code">{data.code}</span>
            <Button variant="dark" size="sm" aria-label="Copy referral code" onClick={() => copy(data.code, 'code')}>
              {copied === 'code' ? <Check size={16} /> : <Copy size={16} />}
            </Button>
          </div>
        </div>

        <div className="sfl-referral-stats mt-4">
          <div><Users size={18} /><strong>{data.signedUpCount}</strong><span>Sign-ups</span></div>
          <div><Check size={18} /><strong>{data.qualifiedCount}</strong><span>Qualified</span></div>
          <div><Gift size={18} /><strong>{formatMoney(data.rewardCents, data.currency)}</strong><span>Earned</span></div>
        </div>

        <Button className="mt-4" variant="outline-dark" onClick={() => copy(data.shareUrl, 'link')}>
          {copied === 'link' ? <Check size={17} className="me-2" /> : <Share2 size={17} className="me-2" />}
          {copied === 'link' ? 'Referral link copied' : 'Copy referral link'}
        </Button>
        {error ? <Alert variant="warning" className="mt-3 mb-0">{error}</Alert> : null}
      </Card.Body>
    </Card>
  );
}
