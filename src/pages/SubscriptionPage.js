import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import { CheckCircle2, Crown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api, moneyFromCents } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingScreen from '../components/LoadingScreen';
import ErrorState from '../components/ErrorState';
import StatusBadge from '../components/StatusBadge';
import CurrencyAmount from '../components/CurrencyAmount';
import PaynowCheckoutModal from '../components/PaynowCheckoutModal';

const PLAN_CODE_ALIASES = Object.freeze({
  monthly: 'monthly',
  'monthly-entry': 'monthly',
  plus: 'plus',
  'plus-monthly': 'plus',
  'plus-plan': 'plus',
  'half-season': 'half-season',
  halfseason: 'half-season',
  season: 'season',
  'season-pass': 'season',
  'supreme-season-pass': 'season',
});

function normalizePlanCode(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[$£]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return PLAN_CODE_ALIASES[normalized] || normalized;
}

function normalizePlan(plan = {}) {
  return {
    ...plan,
    planCode: normalizePlanCode(plan.planCode || plan.code || plan.slug || plan.planName),
  };
}

export default function SubscriptionPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [searchParams] = useSearchParams();
  const handledRequestedPlan = useRef(false);

  const load = async () => {
    setError('');
    try { setData(await api('/api/subscription')); } catch (loadError) { setError(loadError.message); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!data || handledRequestedPlan.current) return;
    const requestedPlanCode = normalizePlanCode(searchParams.get('plan'));
    if (!requestedPlanCode) return;
    const requestedPlan = (data.plans || []).map(normalizePlan).find((plan) => plan.planCode === requestedPlanCode);
    handledRequestedPlan.current = true;
    const alreadyOnRequestedCycle = data.subscription?.planCode === requestedPlan?.planCode
      && data.subscription?.coversCurrentCycle !== false;
    if (requestedPlan && !alreadyOnRequestedCycle) {
      setCheckoutPlan(requestedPlan);
    }
  }, [data, searchParams]);

  const completed = async () => {
    setNotice('Payment confirmed. Your subscription is active, your balance is current, and a receipt email has been sent.');
    setCheckoutPlan(null);
    await load();
  };

  const openCheckout = (rawPlan) => {
    const plan = normalizePlan(rawPlan);
    if (!['monthly', 'plus', 'half-season', 'season'].includes(plan.planCode)) {
      setError(`The selected subscription plan is not configured correctly (${plan.planCode || 'missing code'}).`);
      return;
    }
    setError('');
    setCheckoutPlan(plan);
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <LoadingScreen fullScreen={false} />;

  return (
    <>
      <PageHeader eyebrow="Plans" title="Subscription" description="Choose your Supreme wallet balance or Paynow Express Checkout. Prices and balances are always verified by the server." />
      {notice && <Alert variant="success">{notice}</Alert>}
      {data.wallet && <Alert variant="light"><strong>Available wallet balance: {moneyFromCents(data.wallet.availableBalanceCents)}</strong>. You can choose Wallet or Paynow before confirming each subscription purchase.</Alert>}
      {data.paymentMode === 'paynow' && <Alert variant="light">Paynow methods: EcoCash, OneMoney, InnBucks and O'mari. Wallet payments are deducted only after you tick the confirmation box.</Alert>}

      {data.subscription && (
        <div className="surface-card p-4 mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
            <div>
              <div className="eyebrow">Current plan</div>
              <h2 className="display-6 fw-bold">{data.subscription.planName}</h2>
              <div className="muted">{data.subscription.competitionsIncluded.join(' · ')}</div>
            </div>
            <div className="text-md-end">
              <StatusBadge status={data.subscription.status} />
              <div className="metric-number mt-2"><CurrencyAmount cents={data.subscription.amountCents} /></div>
              <div className="small muted">{data.subscription.billingInterval}</div>
            </div>
          </div>
          <hr />
          <Row className="g-3 small">
            <Col md={3}><div className="muted">Activated</div><strong>{data.subscription.activatedAt ? new Date(data.subscription.activatedAt).toLocaleDateString('en-GB') : '—'}</strong></Col>
            <Col md={3}><div className="muted">Valid until</div><strong>{data.subscription.validUntil ? new Date(data.subscription.validUntil).toLocaleDateString('en-GB') : '—'}</strong></Col>
            <Col md={3}><div className="muted">Last validity check</div><strong>{data.subscription.lastValidityCheckAt ? new Date(data.subscription.lastValidityCheckAt).toLocaleString('en-GB') : '—'}</strong></Col>
            <Col md={3}><div className="muted">Auto-renew</div><strong>{data.subscription.autoRenew ? 'On' : 'Off'}</strong></Col>
          </Row>
        </div>
      )}

      <Row className="g-4 mb-4">
        {(data.plans || []).map(normalizePlan).map((plan) => {
          // A monthly-billed plan can still show status 'active' while its cycle
          // is for a month that's finishing (its validUntil lands right at the
          // next gameweek's deadline). Only treat it as "already have this" when
          // it's also still on the current cycle — otherwise a subbed member
          // would be locked out of renewing for the upcoming gameweek.
          const isSamePlan = data.subscription?.planCode === plan.planCode;
          const isCurrentPlan = isSamePlan && data.subscription?.coversCurrentCycle !== false;
          return (
            <Col md={6} xl={3} key={plan.planCode}>
              <div className="surface-card p-4 h-100 d-flex flex-column">
                <Crown className="text-brand mb-3" />
                <div className="muted small">{plan.planName}</div>
                <div className="display-5 fw-bold">{moneyFromCents(plan.amountCents)}</div>
                <div className="small muted mb-3">{plan.billingInterval} · {plan.validityDays} days</div>
                <div className="flex-grow-1">
                  {plan.competitionsIncluded.map((item) => <div className="d-flex gap-2 small mb-2" key={item}><CheckCircle2 size={16} className="text-brand flex-shrink-0" />{item}</div>)}
                </div>
                <Button className="mt-4" variant={isCurrentPlan ? 'outline-dark' : 'dark'} disabled={isCurrentPlan} onClick={() => openCheckout(plan)}>
                  {isCurrentPlan ? 'Current plan' : isSamePlan ? 'Renew for next cycle' : 'Choose payment method'}
                </Button>
              </div>
            </Col>
          );
        })}
      </Row>

      <div className="surface-card p-4">
        <h2 className="h4">Subscription history</h2>
        {data.history.length ? (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead><tr><th>Plan</th><th>Status</th><th>Payment reference</th><th>Created</th><th className="text-end">Price</th></tr></thead>
              <tbody>{data.history.map((subscription) => (
                <tr key={subscription._id}>
                  <td>{subscription.planName}</td>
                  <td><StatusBadge status={subscription.status} /></td>
                  <td className="small">{subscription.paymentReference || '—'}</td>
                  <td>{new Date(subscription.createdAt).toLocaleDateString('en-GB')}</td>
                  <td className="text-end"><CurrencyAmount cents={subscription.amountCents} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <div className="muted">No subscription payments yet.</div>}
      </div>

      <PaynowCheckoutModal
        show={Boolean(checkoutPlan)}
        onHide={() => setCheckoutPlan(null)}
        purpose="subscription"
        planCode={checkoutPlan?.planCode || ''}
        amountCents={checkoutPlan?.amountCents || 0}
        title={checkoutPlan ? `Pay for ${checkoutPlan.planName}` : 'Subscription checkout'}
        onCompleted={completed}
      />
    </>
  );
}
