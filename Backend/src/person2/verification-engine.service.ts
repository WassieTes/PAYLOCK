import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { decide, VerificationVerdict } from './decision/engine';
import { PaymentClaim } from './entities/payment-claim.entity';
import { LinksEtProvider } from './providers/links-et.provider';
import { isMockReference, MockSandboxProvider } from './providers/mock-sandbox.provider';
import { parseBirrToMinor } from './providers/parsing';
import { ProviderError, ProviderLookup, SettlementRecord } from './providers/provider.types';

export interface VerifyPaymentInput {
  orderId: string; expectedAmount: string | number; expectedReceiver: string;
  reference?: string; receiptUrl?: string; hasReceiptFile?: boolean; orderCreatedAt?: string;
}
export interface VerifyPaymentOutput {
  status: VerificationVerdict; canReleaseOrder: boolean; transactionId: string | null;
  settledAmount: number | null; currency: string | null; provider: string | null;
  mode: 'LIVE' | 'SIMULATED' | null; verifiedAt: string | null; message: string; reasons: string[];
}

@Injectable()
export class VerificationEngineService {
  constructor(@InjectRepository(PaymentClaim) private readonly claims: Repository<PaymentClaim>) {}

  async verify(input: VerifyPaymentInput): Promise<VerifyPaymentOutput> {
    const expectedAmountMinor = parseBirrToMinor(input.expectedAmount);
    if (expectedAmountMinor === null || expectedAmountMinor <= 0 || !Number.isSafeInteger(expectedAmountMinor)) {
      return pending('PENDING_REVIEW', 'Expected amount is invalid.', ['INVALID_EXPECTED_AMOUNT']);
    }
    const expectedReceiver = input.expectedReceiver?.trim();
    if (!expectedReceiver) return pending('PENDING_REVIEW', 'Expected receiver is required.', ['EXPECTED_RECEIVER_REQUIRED']);
    const reference = (input.reference || input.receiptUrl || '').trim();
    if (!reference) return pending('PENDING_REVIEW', input.hasReceiptFile ? 'A receipt image alone cannot prove settlement; provide a transaction reference or verified receipt URL.' : 'Provide a transaction reference or verified receipt URL.', ['REFERENCE_REQUIRED']);

    const now = new Date();
    const createdAt = input.orderCreatedAt && !Number.isNaN(Date.parse(input.orderCreatedAt)) ? new Date(input.orderCreatedAt) : now;
    const lookup: ProviderLookup = {
      reference, receiptUrl: input.receiptUrl || (isHttpsUrl(reference) ? reference : null),
      expectedAmountMinor, expectedReceiver, now,
    };
    let settlement: SettlementRecord;
    try {
      if (isMockReference(reference)) {
        if (process.env.PAYLOCK_USE_SANDBOX !== 'true') return pending('PENDING_REVIEW', 'Sandbox references are disabled. Set PAYLOCK_USE_SANDBOX=true only in development/test environments.', ['SANDBOX_DISABLED']);
        settlement = await new MockSandboxProvider().fetchSettlement(lookup);
      } else {
        settlement = await new LinksEtProvider(
          process.env.LINKS_ET_BASE_URL ?? '',
          process.env.LINKS_ET_API_KEY ?? '',
          (process.env.LINKS_ET_ALLOWED_HOSTS ?? '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean),
        ).fetchSettlement(lookup);
      }
    } catch (error) {
      if (error instanceof ProviderError) {
        const retry = ['TIMEOUT', 'UNAVAILABLE'].includes(error.kind);
        return pending(retry ? 'PENDING_RETRY' : 'PENDING_REVIEW', retry ? 'Authoritative provider is temporarily unavailable; payment remains locked.' : 'Provider could not establish authoritative settlement; manual review is required.', [error.kind]);
      }
      return pending('PENDING_RETRY', 'Unexpected verification failure; payment remains locked.', ['VERIFICATION_ERROR']);
    }

    const existing = await this.claims.findOne({ where: { provider: settlement.provider, transactionId: settlement.transactionId } });
    const decision = decide({
      orderId: input.orderId, expectedAmountMinor, expectedReceiver, orderCreatedAt: createdAt,
      now, settlement, alreadyClaimedBy: existing?.orderId ?? null,
      timeWindowMinutes: nonNegativeInt(process.env.PAYLOCK_TIME_WINDOW_MINUTES, 0),
    });
    if (decision.verdict !== 'VERIFIED') return fromSettlement(decision.verdict, decision.reasons, settlement);

    // The unique DB index is the final concurrency guard. A read-before-write alone is race-prone.
    try {
      if (!existing) await this.claims.insert({ provider: settlement.provider, transactionId: settlement.transactionId, orderId: input.orderId });
    } catch (error) {
      if (isUniqueViolation(error)) {
        const owner = await this.claims.findOne({ where: { provider: settlement.provider, transactionId: settlement.transactionId } });
        if (owner?.orderId !== input.orderId) return fromSettlement('REJECTED', ['DUPLICATE_CLAIM'], settlement);
      } else {
        return pending('PENDING_REVIEW', 'Could not atomically record the transaction claim; payment remains locked.', ['CLAIM_PERSISTENCE_FAILED']);
      }
    }
    return fromSettlement('VERIFIED', [], settlement);
  }
}

function fromSettlement(status: VerificationVerdict, reasons: string[], s: SettlementRecord): VerifyPaymentOutput {
  const amount = s.amountMinor / 100;
  return {
    status, canReleaseOrder: status === 'VERIFIED', transactionId: s.transactionId,
    settledAmount: amount, currency: s.currency, provider: s.provider, mode: s.mode,
    verifiedAt: status === 'VERIFIED' ? new Date().toISOString() : null,
    message: status === 'VERIFIED' ? 'Settlement verified by the configured provider.' : messageFor(status, reasons), reasons,
  };
}
function pending(status: 'PENDING_REVIEW' | 'PENDING_RETRY', message: string, reasons: string[]): VerifyPaymentOutput {
  return { status, canReleaseOrder: false, transactionId: null, settledAmount: null, currency: null, provider: null, mode: null, verifiedAt: null, message, reasons };
}
function messageFor(status: VerificationVerdict, reasons: string[]): string {
  if (reasons.includes('DUPLICATE_CLAIM')) return 'Transaction has already been claimed by another order.';
  if (status === 'REJECTED') return `Settlement did not satisfy verification rules: ${reasons.join(', ')}.`;
  return `Settlement needs review: ${reasons.join(', ')}.`;
}
function isHttpsUrl(value: string): boolean { try { return new URL(value).protocol === 'https:'; } catch { return false; } }
function nonNegativeInt(value: string | undefined, fallback: number): number { const n = Number(value); return Number.isInteger(n) && n >= 0 ? n : fallback; }
function isUniqueViolation(error: unknown): boolean { return !!error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === '23505'; }
