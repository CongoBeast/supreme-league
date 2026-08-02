import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleDollarSign,
  Search,
  WalletCards,
} from 'lucide-react';

import {
  adminApi,
  buildQuery,
  dateTime,
  humanize,
  money,
} from '../adminApi';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from '../components/AdminDataState';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminPagination from '../components/AdminPagination';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

const transactionTypes = [
  'deposit',
  'subscription',
  'entry-fee',
  'platform-fee',
  'prize',
  'withdrawal',
  'refund',
  'adjustment',
];

const transactionStatuses = [
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded',
];

function sumSummary(summary, predicate) {
  return summary
    .filter((item) => predicate(item._id || {}))
    .reduce((total, item) => total + Number(item.amountCents || 0), 0);
}

export default function AdminFinancesPage() {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    provider: '',
    status: '',
    direction: '',
    minAmount: '',
    maxAmount: '',
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusBusy, setStatusBusy] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      const firstLoad = !data;
      firstLoad ? setLoading(true) : setRefreshing(true);
      setError('');

      try {
        const query = buildQuery({ ...filters, page, limit: 50 });
        setData(await adminApi(`/transactions?${query}`));
      } catch (requestError) {
        setError(requestError.message || 'The financial records could not be loaded.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, filters.search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [filters, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const totals = useMemo(() => {
    const summary = data?.summary || [];
    const completedCredit = (id) => id.status === 'completed' && id.direction === 'credit';

    return {
      inflow: sumSummary(summary, completedCredit),
      subscriptions: sumSummary(
        summary,
        (id) => completedCredit(id) && id.type === 'subscription'
      ),
      leagueRevenue: sumSummary(
        summary,
        (id) => completedCredit(id) && ['entry-fee', 'platform-fee'].includes(id.type)
      ),
      payoutsDue: sumSummary(
        summary,
        (id) =>
          ['prize', 'withdrawal'].includes(id.type) &&
          ['pending', 'processing'].includes(id.status)
      ),
    };
  }, [data]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const openTransaction = async (id) => {
    setModalLoading(true);
    setSelected({ _id: id });

    try {
      const result = await adminApi(`/transactions/${id}`);
      setSelected(result.transaction);
    } catch (requestError) {
      setError(requestError.message || 'The transaction details could not be loaded.');
      setSelected(null);
    } finally {
      setModalLoading(false);
    }
  };


  const updateWithdrawalStatus = async (status) => {
    if (!selected?._id) return;
    setStatusBusy(true);
    setError('');
    try {
      const result = await adminApi(`/withdrawals/${selected._id}/status`, { method: 'PATCH', body: { status, note: adminNote } });
      setSelected(result.transaction);
      setAdminNote('');
      const query = buildQuery({ ...filters, page, limit: 50 });
      setData(await adminApi(`/transactions?${query}`));
    } catch (requestError) {
      setError(requestError.message || 'The withdrawal status could not be updated.');
    } finally { setStatusBusy(false); }
  };

  if (loading) {
    return <AdminLoading message="Loading financial activity…" />;
  }

  if (error && !data) {
    return <AdminError message={error} />;
  }

  return (
    <>
      <AdminPageHeader
        title="Financial management"
        description="Review incoming funds, subscriptions, league fees, payouts and every recorded transaction."
      />

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <StatCard
            label="Completed inflow"
            value={money(totals.inflow)}
            detail="All completed credit transactions"
            icon={ArrowDownToLine}
            tone="success"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Subscriptions"
            value={money(totals.subscriptions)}
            detail="Completed subscription revenue"
            icon={WalletCards}
            tone="primary"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="League revenue"
            value={money(totals.leagueRevenue)}
            detail="Entry and platform fees"
            icon={CircleDollarSign}
            tone="warning"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Payouts due"
            value={money(totals.payoutsDue)}
            detail="Pending prizes and withdrawals"
            icon={ArrowUpFromLine}
            tone="danger"
          />
        </Col>
      </Row>

      <Card className="admin-card admin-filter-card">
        <Card.Body>
          <Row className="g-3">
            <Col xl={4}>
              <Form.Label className="admin-filter-label">Search transactions</Form.Label>
              <div className="position-relative">
                <Search
                  size={17}
                  className="position-absolute top-50 translate-middle-y text-secondary"
                  style={{ left: 14 }}
                />
                <Form.Control
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="Reference or description"
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </Col>
            <Col sm={6} md={4} xl={2}>
              <Form.Label className="admin-filter-label">Purpose</Form.Label>
              <Form.Select
                value={filters.type}
                onChange={(event) => updateFilter('type', event.target.value)}
              >
                <option value="">All purposes</option>
                {transactionTypes.map((type) => (
                  <option key={type} value={type}>{humanize(type)}</option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={6} md={4} xl={2}>
              <Form.Label className="admin-filter-label">Status</Form.Label>
              <Form.Select
                value={filters.status}
                onChange={(event) => updateFilter('status', event.target.value)}
              >
                <option value="">All statuses</option>
                {transactionStatuses.map((status) => (
                  <option key={status} value={status}>{humanize(status)}</option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={6} md={4} xl={2}>
              <Form.Label className="admin-filter-label">Direction</Form.Label>
              <Form.Select
                value={filters.direction}
                onChange={(event) => updateFilter('direction', event.target.value)}
              >
                <option value="">Both directions</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </Form.Select>
            </Col>
            <Col sm={6} md={4} xl={2}>
              <Form.Label className="admin-filter-label">Provider</Form.Label>
              <Form.Control
                value={filters.provider}
                onChange={(event) => updateFilter('provider', event.target.value)}
                placeholder="e.g. paynow"
              />
            </Col>
            <Col sm={6} md={4} xl={2}>
              <Form.Label className="admin-filter-label">Minimum amount</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={filters.minAmount}
                onChange={(event) => updateFilter('minAmount', event.target.value)}
                placeholder="0.00"
              />
            </Col>
            <Col sm={6} md={4} xl={2}>
              <Form.Label className="admin-filter-label">Maximum amount</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={filters.maxAmount}
                onChange={(event) => updateFilter('maxAmount', event.target.value)}
                placeholder="0.00"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <AdminError message={error} />}
      {refreshing && <AdminLoading compact message="Updating transaction results…" />}

      <Card className="admin-card admin-table-card mt-3">
        {data?.rows?.length ? (
          <>
            <Table responsive hover className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>User</th>
                  <th>Purpose</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className="admin-transaction-row"
                    onClick={() => openTransaction(transaction._id)}
                  >
                    <td>{dateTime(transaction.createdAt)}</td>
                    <td>
                      <div className="admin-table-primary">{transaction.reference}</div>
                      <div className="admin-table-secondary">
                        {humanize(transaction.direction)}
                      </div>
                    </td>
                    <td>
                      <div className="admin-table-primary">
                        {transaction.userId?.fullName || 'System transaction'}
                      </div>
                      <div className="admin-table-secondary">
                        {transaction.userId?.email || '—'}
                      </div>
                    </td>
                    <td>{humanize(transaction.type)}</td>
                    <td>{humanize(transaction.provider)}</td>
                    <td><StatusBadge value={transaction.status} /></td>
                    <td className="fw-semibold">{money(transaction.amountCents)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <AdminPagination pagination={data.pagination} onPageChange={setPage} />
          </>
        ) : (
          <AdminEmpty
            title="No transactions match these filters"
            message="Change the purpose, status, provider, amount range or search term."
          />
        )}
      </Card>

      <Modal
        show={Boolean(selected)}
        onHide={() => setSelected(null)}
        size="lg"
        centered
        contentClassName="admin-modal-details"
      >
        <Modal.Header closeButton>
          <Modal.Title>Transaction details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalLoading ? (
            <AdminLoading compact message="Loading transaction details…" />
          ) : selected ? (
            <dl className="admin-detail-grid mb-0">
              <div className="admin-detail-item">
                <dt>Reference</dt>
                <dd>{selected.reference || '—'}</dd>
              </div>
              <div className="admin-detail-item">
                <dt>Status</dt>
                <dd><StatusBadge value={selected.status} /></dd>
              </div>
              <div className="admin-detail-item">
                <dt>Amount</dt>
                <dd>{money(selected.amountCents)}</dd>
              </div>
              <div className="admin-detail-item">
                <dt>Direction</dt>
                <dd>{humanize(selected.direction)}</dd>
              </div>
              <div className="admin-detail-item">
                <dt>Purpose</dt>
                <dd>{humanize(selected.type)}</dd>
              </div>
              <div className="admin-detail-item">
                <dt>Provider</dt>
                <dd>{humanize(selected.provider)}</dd>
              </div>
              <div className="admin-detail-item">
                <dt>Payment method</dt>
                <dd>{humanize(selected.paymentMethod)}</dd>
              </div>
              <div className="admin-detail-item">
                <dt>Created</dt>
                <dd>{dateTime(selected.createdAt)}</dd>
              </div>
              <div className="admin-detail-item">
                <dt>User</dt>
                <dd>{selected.userId?.fullName || selected.userId?.email || 'System'}</dd>
              </div>
              <div className="admin-detail-item">
                <dt>League</dt>
                <dd>{selected.leagueId?.name || '—'}</dd>
              </div>
              <div className="admin-detail-item">
                <dt>Description</dt>
                <dd>{selected.description || '—'}</dd>
              </div>
              <div className="admin-detail-item">
                <dt>Last updated</dt>
                <dd>{dateTime(selected.updatedAt)}</dd>
              </div>
            </dl>
          ) : null}
          {selected?.type === 'withdrawal' && !modalLoading && <div className="mt-4 border-top pt-3">
            <h3 className="h6">Withdrawal review</h3>
            <Alert variant="info" className="small">Payouts must be made only to the USD destination shown below. The user is emailed whenever the status changes.</Alert>
            <Row className="g-2 mb-3">
              <Col md={6}><strong>Method:</strong> {selected.metadata?.method || '—'}</Col>
              <Col md={6}><strong>Bank:</strong> {selected.metadata?.bankName || '—'}</Col>
              <Col md={6}><strong>Branch:</strong> {selected.metadata?.branchNumber || '—'}</Col>
              <Col md={6}><strong>Account:</strong> {selected.metadata?.accountNumber || '—'} (USD)</Col>
            </Row>
            <Form.Control as="textarea" rows={2} className="mb-3" placeholder="Optional internal note" value={adminNote} onChange={(event) => setAdminNote(event.target.value)} />
            <div className="d-flex flex-wrap gap-2">
              {selected.status === 'pending' && <Button disabled={statusBusy} onClick={() => updateWithdrawalStatus('processing')}>Mark processing</Button>}
              {['pending','processing'].includes(selected.status) && <Button variant="success" disabled={statusBusy} onClick={() => updateWithdrawalStatus('completed')}>Mark paid</Button>}
              {['pending','processing'].includes(selected.status) && <Button variant="danger" disabled={statusBusy} onClick={() => updateWithdrawalStatus('rejected')}>Reject</Button>}
              {['pending','processing'].includes(selected.status) && <Button variant="outline-secondary" disabled={statusBusy} onClick={() => updateWithdrawalStatus('cancelled')}>Cancel</Button>}
            </div>
          </div>}
        </Modal.Body>
      </Modal>
    </>
  );
}
