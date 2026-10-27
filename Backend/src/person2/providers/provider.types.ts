export type SettlementStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'UNKNOWN';
export type ProviderMode = 'LIVE' | 'SIMULATED';

/** Normalized provider data. Money is integer santim (1 ETB = 100 santim). */
export interface SettlementRecord {
  provider: string;
  transactionId: string;
  status: SettlementStatus;
  amountMinor: number;
  currency: string;
  paidAt: Date | null;
  receiverAccount: string | null;
  receiverName: string | null;
  mode: ProviderMode;
  /** Raw provider response is sensitive and must never be logged. */
  raw?: unknown;
}

export interface ProviderLookup {
  reference: string;
  receiptUrl: string | null;
  expectedAmountMinor: number;
  expectedReceiver: string;
  now: Date;
}

export type ProviderErrorKind = 'NOT_FOUND' | 'TIMEOUT' | 'UNAVAILABLE' | 'BAD_RESPONSE' | 'UNSUPPORTED';
export class ProviderError extends Error {
  constructor(readonly kind: ProviderErrorKind, message: string) { super(message); this.name = 'ProviderError'; }
}

export interface PaymentVerificationProvider {
  readonly name: string;
  readonly mode: ProviderMode;
  fetchSettlement(input: ProviderLookup): Promise<SettlementRecord>;
}
