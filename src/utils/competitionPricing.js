// Subscription-only leagues store a zero one-off entry fee by design.
// A zero fee does not mean the subscription price is zero.
const usd = (cents) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'USD' }).format(Number(cents) / 100);

export function competitionEntryLabel(league = {}) {
  if (league.freeEntry === true) return 'Free (Clash of the Captains)';
  const cents = Number(league.accessPriceCents);
  if (league.oneOffAllowed === true && Number.isFinite(cents) && cents > 0) {
    return `${usd(cents)} one-off or eligible subscription`;
  }
  if (league.subscriptionOnly === true || league.priceType === 'subscription') {
    return Number.isFinite(cents) && cents > 0 ? `From ${usd(cents)} / subscription` : 'Paid subscription required';
  }
  // Older custom paid competitions may not have a pricing policy payload.
  if (league.officialSupremeLeague !== true && Number(league.entryFeeCents) > 0) {
    return `${usd(league.entryFeeCents)} one-off`;
  }
  return 'Access price unavailable';
}

export const requiresSubscription = (league = {}) =>
  league.subscriptionOnly === true || league.priceType === 'subscription';
