import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from 'react-bootstrap';

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return <div className="empty-state"><AlertTriangle size={34} className="mb-3" /><h3 className="h5">Unable to load this section</h3><p className="muted">{message}</p>{onRetry && <Button variant="dark" onClick={onRetry}>Try again</Button>}</div>;
}
