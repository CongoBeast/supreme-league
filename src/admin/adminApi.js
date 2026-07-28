import { api } from '../services/api';

export const adminApi = (path, options = {}) => api(`/api/admin${path}`, options);

export const money = (cents = 0) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(cents || 0) / 100);

export const dateTime = (value) =>
  value
    ? new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : '—';

export const humanize = (value) =>
  String(value || '—')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const buildQuery = (values = {}) => {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });

  return params.toString();
};
