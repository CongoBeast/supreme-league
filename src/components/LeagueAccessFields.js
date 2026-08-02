import React from 'react';
import { Alert, Col, Form, Row } from 'react-bootstrap';
import { AlertTriangle, Globe2, LockKeyhole } from 'lucide-react';
import RequiredLabel from './RequiredLabel';

export default function LeagueAccessFields({ values, onChange, started = false }) {
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
              onChange={(event) => onChange('joinDeadlineAt', event.target.value)}
            />
            <Form.Text className="text-muted">No new paid entries are accepted after this time.</Form.Text>
          </Form.Group>
        </Col>
      </Row>
      <Form.Check
        className="mt-3"
        type="switch"
        id="allowLateJoin"
        label="Allow joining after the league has started, until the joining deadline"
        checked={values.allowLateJoin !== false}
        onChange={(event) => onChange('allowLateJoin', event.target.checked)}
      />
      {(started || values.allowLateJoin !== false) ? (
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
