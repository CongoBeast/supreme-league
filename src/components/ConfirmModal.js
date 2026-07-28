import React from 'react';
import { Button, Modal } from 'react-bootstrap';

export default function ConfirmModal({ show, onHide, onConfirm, title, body, confirmLabel = 'Confirm', busy = false }) {
  return <Modal show={show} onHide={onHide} centered><Modal.Header closeButton><Modal.Title>{title}</Modal.Title></Modal.Header><Modal.Body>{body}</Modal.Body><Modal.Footer><Button variant="light" onClick={onHide} disabled={busy}>Cancel</Button><Button variant="primary" onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : confirmLabel}</Button></Modal.Footer></Modal>;
}
