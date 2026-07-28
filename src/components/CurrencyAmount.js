import React from 'react';
import { moneyFromCents } from '../services/api';

export default function CurrencyAmount({ cents = 0, currency = 'USD', className = '' }) {
  return <span className={className}>{moneyFromCents(cents, currency)}</span>;
}
