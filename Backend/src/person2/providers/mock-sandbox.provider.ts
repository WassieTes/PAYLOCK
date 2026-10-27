import { PaymentVerificationProvider, ProviderError, ProviderLookup, SettlementRecord } from './provider.types';

const MOCK_REFERENCE = /^MOCK(GENUINE|FORGED|DOWN|NORECEIVER|WRONGRECEIVER|NOTFOUND|UNPAID|BADRESPONSE)([A-Z0-9-]*)$/;
export function isMockReference(value: string): boolean { return MOCK_REFERENCE.test(value.trim().toUpperCase()); }

/** Deterministic development provider. Every result is labelled SIMULATED and never represents bank truth. */
export class MockSandboxProvider implements PaymentVerificationProvider {
  readonly name = 'mock';
  readonly mode = 'SIMULATED' as const;

  async fetchSettlement(input: ProviderLookup): Promise<SettlementRecord> {
    const reference = input.reference.trim().toUpperCase();
    const match = MOCK_REFERENCE.exec(reference);
    if (!match) throw new ProviderError('UNSUPPORTED', 'Unsupported sandbox reference');
    const scenario = match[1];
    if (scenario === 'DOWN') throw new ProviderError('UNAVAILABLE', 'Simulated upstream outage');
    if (scenario === 'NOTFOUND') throw new ProviderError('NOT_FOUND', 'Simulated transaction not found');
    if (scenario === 'BADRESPONSE') throw new ProviderError('BAD_RESPONSE', 'Simulated malformed provider response');
    const amountMinor = scenario === 'FORGED' ? Math.max(1, Math.floor(input.expectedAmountMinor / 17)) : input.expectedAmountMinor;
    return {
      provider: 'mock', transactionId: reference,
      status: scenario === 'UNPAID' ? 'PENDING' : 'COMPLETED',
      amountMinor, currency: 'ETB', paidAt: input.now,
      receiverAccount: scenario === 'NORECEIVER' ? null : scenario === 'WRONGRECEIVER' ? '0000000000' : input.expectedReceiver,
      receiverName: scenario === 'NORECEIVER' ? null : input.expectedReceiver,
      mode: 'SIMULATED', raw: { scenario },
    };
  }
}
