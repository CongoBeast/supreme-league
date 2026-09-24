const STORAGE_KEY = 'sfl_marketing_attribution_v1';
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

const clean = (value, max = 180) => String(value || '').trim().slice(0, max);

export function captureMarketingAttribution() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search || '');
  const touch = {
    source: clean(params.get('utm_source'), 80),
    medium: clean(params.get('utm_medium'), 80),
    campaignId: clean(params.get('meta_campaign_id') || params.get('campaign_id'), 120),
    campaignName: clean(params.get('utm_campaign') || params.get('campaign_name'), 180),
    adsetId: clean(params.get('meta_adset_id') || params.get('adset_id') || params.get('ad_set_id'), 120),
    adsetName: clean(params.get('meta_adset_name') || params.get('adset_name'), 180),
    adId: clean(params.get('meta_ad_id') || params.get('ad_id'), 120),
    adName: clean(params.get('utm_content') || params.get('meta_ad_name') || params.get('ad_name'), 180),
    fbclid: clean(params.get('fbclid'), 500),
    landingPath: clean(`${window.location.pathname}${window.location.search}`, 500),
    firstTouchAt: new Date().toISOString(),
  };
  const hasTouch = Boolean(touch.source || touch.medium || touch.campaignId || touch.adsetId || touch.adId || touch.fbclid);
  if (!hasTouch) return getStoredMarketingAttribution();
  try {
    const existing = getStoredMarketingAttribution();
    if (!existing) localStorage.setItem(STORAGE_KEY, JSON.stringify(touch));
    return existing || touch;
  } catch {
    return touch;
  }
}

export function getStoredMarketingAttribution() {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!parsed?.firstTouchAt) return null;
    const age = Date.now() - new Date(parsed.firstTouchAt).getTime();
    if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearMarketingAttribution() {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore storage errors */ }
}
