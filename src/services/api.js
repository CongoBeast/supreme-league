const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export async function api(path, options = {}) {
  const {
    headers: customHeaders = {},
    body,
    ...fetchOptions
  } = options;

  const requestBody = body && typeof body !== 'string'
    ? JSON.stringify(body)
    : body;

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...fetchOptions,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...customHeaders,
    },
    body: requestBody,
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = {
      success: false,
      message: 'The server returned an invalid response.',
    };
  }

  // if (response.status === 401 && !path.includes('/api/auth/')) {
  //   window.dispatchEvent(new CustomEvent('sfl:session-expired'));
  // }

  const sessionMessages = [
  'Session expired. Please log in again.',
  'Invalid session. Please log in again.',
  'Session is no longer valid.',
];

    if (
      response.status === 401 &&
      sessionMessages.includes(payload.message)
    ) {
      window.dispatchEvent(
        new CustomEvent('sfl:session-expired', {
          detail: {
            message: payload.message,
            path,
          },
        })
      );
    }

  if (!response.ok || payload.success === false) {
    const error = new Error(payload.message || 'Request failed.');
    error.status = response.status;
    error.errors = payload.errors || [];
    throw error;
  }

  return payload.data;
}

export function moneyFromCents(cents = 0, currency = 'USD') {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(Number(cents || 0) / 100);
}
