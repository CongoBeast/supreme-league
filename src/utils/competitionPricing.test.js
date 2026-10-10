import { competitionEntryLabel, requiresSubscription } from './competitionPricing';

test('zero one-off monthly league access is paid, not Free or $0.00', () => {
  const league = { officialSupremeLeague: true, subscriptionOnly: true, priceType: 'subscription', accessPriceCents: 200, entryFeeCents: 0 };
  expect(competitionEntryLabel(league)).toContain('$2.00');
  expect(competitionEntryLabel(league)).not.toContain('Free');
  expect(competitionEntryLabel(league)).not.toContain('$0.00');
  expect(requiresSubscription(league)).toBe(true);
});

test('only explicitly free competition renders Clash free entry', () => {
  expect(competitionEntryLabel({ officialSupremeLeague: true, freeEntry: true })).toBe('Free (Clash of the Captains)');
  expect(competitionEntryLabel({ officialSupremeLeague: true, subscriptionOnly: true, entryFeeCents: 0 })).toContain('Paid subscription required');
});
