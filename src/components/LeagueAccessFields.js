import React from 'react';
import { Alert, Col, Form, Row } from 'react-bootstrap';
import { AlertTriangle, Globe2, LockKeyhole } from 'lucide-react';
import RequiredLabel from './RequiredLabel';

const toLocalDateTimeInput = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function LeagueAccessFields({ values, onChange, started = false, fplDeadlineAt = '', lockLateJoin = false }) {
  const latestJoinDeadline = toLocalDateTimeInput(fplDeadlineAt);

  return (
    <div className="sfl-league-access-panel">
      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="leagueVisibility">
            <Form.Label><RequiredLabel>League access</RequiredLabel></Form.Label>
            <Form.Select required value={values.visibility || 'private'} onChange={(event) => onChange('visibility', event.target.value)}>
              <option value="private">Private — invitation code required</option>
              <option value="public">Public — visible and joinable by eligible users</option>
            </Form.Select>
            <Form.Text className="text-muted d-flex align-items-center gap-1 mt-2">
              {values.visibility === 'public' ? <Globe2 size={14} /> : <LockKeyhole size={14} />}
              {values.visibility === 'public' ? 'This league can appear in Discover.' : 'Only people with the code can access it.'}
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="joinDeadlineAt">
            <Form.Label><RequiredLabel>Joining deadline</RequiredLabel></Form.Label>
            <Form.Control
              type="datetime-local"
              required
              value={values.joinDeadlineAt || ''}
              max={latestJoinDeadline || undefined}
              onChange={(event) => onChange('joinDeadlineAt', event.target.value)}
            />
            <Form.Text className="text-muted">
              {latestJoinDeadline
                ? `Must be on or before the official FPL gameweek deadline. Latest allowed: ${new Date(fplDeadlineAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}.`
                : 'No new paid entries are accepted after this time.'}
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <Form.Check
        className="mt-3"
        type="switch"
        id="allowLateJoin"
        label={lockLateJoin ? 'Late joining is disabled for FPL-aligned leagues' : 'Allow joining after the league has started, until the joining deadline'}
        checked={lockLateJoin ? false : values.allowLateJoin !== false}
        disabled={lockLateJoin}
        onChange={(event) => onChange('allowLateJoin', lockLateJoin ? false : event.target.checked)}
      />

      {lockLateJoin ? (
        <Alert variant="light" className="mt-3 mb-0 border small">
          Entries must be confirmed before the official FPL deadline. The competition itself remains live until FPL marks the ending gameweek as finished.
        </Alert>
      ) : (started || values.allowLateJoin !== false) ? (
        <Alert variant="warning" className="mt-3 mb-0 d-flex gap-2 align-items-start">
          <AlertTriangle size={20} className="flex-shrink-0 mt-1" />
          <div>
            <strong>Late-entry warning</strong>
            <div>If you join a league after it has started, your chances of winning may be slim because other members can already be far ahead.</div>
          </div>
        </Alert>
      ) : null}
    </div>
  );
}
