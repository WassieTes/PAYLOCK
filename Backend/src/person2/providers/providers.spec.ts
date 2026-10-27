import { parseBirrToMinor, normalizeReceiver } from './parsing';
import { MockSandboxProvider, isMockReference } from './mock-sandbox.provider';

describe('provider helpers', () => {
  it('parses ETB amounts into integer santim', () => {
    expect(parseBirrToMinor('1,200.50 Birr')).toBe(120050);
    expect(parseBirrToMinor('850')).toBe(85000);
    expect(parseBirrToMinor('no amount')).toBeNull();
  });
  it('normalizes receiver identifiers', () => expect(normalizeReceiver('+251 911-000-000')).toBe('251911000000'));
  it('recognizes explicit sandbox references', () => {
    expect(isMockReference('MOCKGENUINE-1')).toBe(true);
    expect(isMockReference('FT-12345')).toBe(false);
  });
  it('labels sandbox settlements as simulated', async () => {
    const result = await new MockSandboxProvider().fetchSettlement({ reference: 'MOCKGENUINE-1', receiptUrl: null, expectedAmountMinor: 85000, expectedReceiver: '0911000000', now: new Date() });
    expect(result.mode).toBe('SIMULATED');
    expect(result.status).toBe('COMPLETED');
  });
});
