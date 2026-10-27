import { normalizeReceiver } from '../providers/parsing';
import { SettlementRecord } from '../providers/provider.types';

export type VerificationVerdict = 'VERIFIED' | 'REJECTED' | 'PENDING_REVIEW' | 'PENDING_RETRY';
export interface DecisionInput {
  orderId: string; expectedAmountMinor: number; expectedReceiver: string;
  orderCreatedAt: Date; now: Date; settlement: SettlementRecord; alreadyClaimedBy: string | null;
  timeWindowMinutes: number;
}
export interface DecisionResult { verdict: VerificationVerdict; reasons: string[]; canReleaseOrder: boolean }

/** Pure decision engine: only authoritative provider settlement can produce VERIFIED. */
export function decide(input: DecisionInput): DecisionResult {
  const { settlement: s } = input;
  const reasons: string[] = [];
  if (s.status !== 'COMPLETED') reasons.push(s.status === 'PENDING' ? 'PAYMENT_NOT_COMPLETED' : s.status === 'FAILED' ? 'PAYMENT_FAILED' : 'PROVIDER_STATUS_UNKNOWN');
  if (
  !Number.isSafeInteger(s.amountMinor) ||
  s.amountMinor !== input.expectedAmountMinor
) {
  reasons.push('AMOUNT_MISMATCH');
}
  if (s.currency.toUpperCase() !== 'ETB') reasons.push('CURRENCY_MISMATCH');
  const expected = normalizeReceiver(input.expectedReceiver);
  const account = s.receiverAccount ? normalizeReceiver(s.receiverAccount) : '';
  const name = s.receiverName ? normalizeReceiver(s.receiverName) : '';
  if (!account && !name) reasons.push('RECEIVER_NOT_PROVIDED');
  else if (expected !== account && expected !== name) reasons.push('RECEIVER_MISMATCH');
  if (!s.paidAt) reasons.push('PAYMENT_DATE_MISSING');
  else {
    const min = input.orderCreatedAt.getTime() - input.timeWindowMinutes * 60_000;
    const max = input.now.getTime() + 5 * 60_000;
    if (s.paidAt.getTime() < min || s.paidAt.getTime() > max) reasons.push('TIME_WINDOW_VIOLATION');
  }
  if (input.alreadyClaimedBy && input.alreadyClaimedBy !== input.orderId) reasons.push('DUPLICATE_CLAIM');
  if (reasons.includes('DUPLICATE_CLAIM')) return { verdict: 'REJECTED', reasons, canReleaseOrder: false };
  if (reasons.some(r => ['AMOUNT_MISMATCH', 'CURRENCY_MISMATCH', 'RECEIVER_MISMATCH', 'TIME_WINDOW_VIOLATION', 'PAYMENT_FAILED', 'PAYMENT_NOT_COMPLETED'].includes(r))) {
    return { verdict: 'REJECTED', reasons, canReleaseOrder: false };
  }
  if (reasons.length) return { verdict: 'PENDING_REVIEW', reasons, canReleaseOrder: false };
  return { verdict: 'VERIFIED', reasons: [], canReleaseOrder: true };
}
