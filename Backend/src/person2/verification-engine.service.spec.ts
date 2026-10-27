import { decide } from './decision/engine';
import { SettlementRecord } from './providers/provider.types';

const base: SettlementRecord = {
  provider: 'mock', transactionId: 'MOCKGENUINE-1', status: 'COMPLETED', amountMinor: 85000,
  currency: 'ETB', paidAt: new Date('2026-10-27T10:00:00Z'), receiverAccount: '0911000000',
  receiverName: 'Example Merchant', mode: 'SIMULATED',
};
const input = (overrides: Partial<Parameters<typeof decide>[0]> = {}) => ({
  orderId: 'order-1', expectedAmountMinor: 85000, expectedReceiver: '0911000000',
  orderCreatedAt: new Date('2026-10-27T09:00:00Z'), now: new Date('2026-10-27T10:01:00Z'),
  settlement: base, alreadyClaimedBy: null, timeWindowMinutes: 1440, ...overrides,
});

describe('Person 2 decision engine', () => {
  it('verifies a completed matching ETB settlement', () => {
    expect(decide(input()).verdict).toBe('VERIFIED');
  });
  it('rejects an overpayment', () => {
  const result = decide(
    input({
      settlement: { ...base, amountMinor: 90000 },
    }),
  );

  expect(result.verdict).toBe('REJECTED');
  expect(result.reasons).toContain('AMOUNT_MISMATCH');
  expect(result.canReleaseOrder).toBe(false);
});
  it('rejects a receiver mismatch', () => {
    expect(decide(input({ settlement: { ...base, receiverAccount: '0999999999' } })).reasons).toContain('RECEIVER_MISMATCH');
  });
  it('rejects a transaction already owned by another order', () => {
    const result = decide(input({ alreadyClaimedBy: 'order-2' }));
    expect(result.verdict).toBe('REJECTED');
    expect(result.reasons).toContain('DUPLICATE_CLAIM');
  });
  it('sends missing authoritative receiver data to review', () => {
    expect(decide(input({ settlement: { ...base, receiverAccount: null, receiverName: null } })).verdict).toBe('PENDING_REVIEW');
  });
  it('does not verify pending provider transactions', () => {
    expect(decide(input({ settlement: { ...base, status: 'PENDING' } })).verdict).toBe('REJECTED');
  });
});
