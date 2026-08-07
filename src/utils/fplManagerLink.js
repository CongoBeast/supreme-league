const FPL_HOSTS = new Set([
  'fantasy.premierleague.com',
  'www.fantasy.premierleague.com',
]);

export function extractFplManagerId(rawValue) {
  const value = String(rawValue || '').trim();
  if (!value) return { managerId: '', valid: false, error: '' };

  if (/^\d+$/.test(value)) {
    return { managerId: value, valid: true, error: '' };
  }

  let parsed;
  try {
    const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    parsed = new URL(candidate);
  } catch {
    return {
      managerId: '',
      valid: false,
      error: 'Paste a Fantasy Premier League team link, or enter your numeric manager ID.',
    };
  }

  if (!FPL_HOSTS.has(parsed.hostname.toLowerCase())) {
    return {
      managerId: '',
      valid: false,
      error: 'That link is not from fantasy.premierleague.com.',
    };
  }

  const match = parsed.pathname.match(/\/entry\/(\d+)(?:\/|$)/i);
  if (!match) {
    return {
      managerId: '',
      valid: false,
      error: 'We could not find a manager number in that FPL link. Open your FPL team and copy the page link again.',
    };
  }

  return { managerId: match[1], valid: true, error: '' };
}
