import { parseBirrToMinor, parseProviderDate } from './parsing';
import { PaymentVerificationProvider, ProviderError, ProviderLookup, SettlementRecord } from './provider.types';

/**
 * Links.et adapter. IMPORTANT: endpoint (/api/verify), x-api-key header and response field mapping
 * are assumptions inherited from the source project and must be confirmed against the live provider contract.
 * Redirects are disabled and receipt hosts are explicitly allow-listed before the URL is sent upstream.
 */
export class LinksEtProvider implements PaymentVerificationProvider {
  readonly name = 'links.et';
  readonly mode = 'LIVE' as const;
  constructor(
    private readonly baseUrl = '',
    private readonly apiKey = '',
    private readonly allowedHosts: string[] = [],
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  async fetchSettlement(input: ProviderLookup): Promise<SettlementRecord> {
    if (!this.baseUrl || !this.apiKey) throw new ProviderError('UNAVAILABLE', 'Links.et is not configured');
    if (!input.receiptUrl) throw new ProviderError('UNSUPPORTED', 'Live verification requires a receipt URL');
    let receipt: URL;
    try { receipt = new URL(input.receiptUrl); } catch { throw new ProviderError('UNSUPPORTED', 'Receipt URL is invalid'); }
    if (receipt.protocol !== 'https:' || !this.allowedHosts.includes(receipt.hostname.toLowerCase()) || receipt.username || receipt.password) {
      throw new ProviderError('UNSUPPORTED', 'Receipt URL is not on the configured HTTPS allowlist');
    }
    const base = new URL(this.baseUrl);
    if (base.protocol !== 'https:') throw new ProviderError('UNSUPPORTED', 'Links.et base URL must use HTTPS');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let response: Response;
    try {
      response = await this.fetchFn(`${this.baseUrl.replace(/\/$/, '')}/api/verify`, {
        method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': this.apiKey },
        body: JSON.stringify({ url: receipt.toString() }), signal: controller.signal, redirect: 'manual',
      });
    } catch (error) {
      throw new ProviderError((error as { name?: string }).name === 'AbortError' ? 'TIMEOUT' : 'UNAVAILABLE', 'Links.et request failed');
    } finally { clearTimeout(timeout); }
    if (response.status === 429 || response.status >= 500) throw new ProviderError('UNAVAILABLE', `Links.et returned HTTP ${response.status}`);
    if (response.status === 401 || response.status === 403) throw new ProviderError('UNAVAILABLE', 'Links.et credentials were rejected');
    if (response.status === 404) throw new ProviderError('NOT_FOUND', 'Receipt was not found by Links.et');
    if (!response.ok) throw new ProviderError('BAD_RESPONSE', `Links.et returned HTTP ${response.status}`);
    let data: any;
    try { data = await response.json(); } catch { throw new ProviderError('BAD_RESPONSE', 'Links.et returned invalid JSON'); }
    const row = data?.receipt ?? data?.data?.receipt ?? data?.data ?? data;
    const transactionId = firstString(row, ['receiptNo', 'transactionId', 'transaction_id', 'reference']);
    const amountMinor = parseBirrToMinor(row?.settledAmount ?? row?.amount ?? row?.settled_amount);
    if (!transactionId || amountMinor === null || amountMinor <= 0) throw new ProviderError('BAD_RESPONSE', 'Links.et response lacks transaction id or amount');
    const rawStatus = String(row?.transactionStatus ?? row?.status ?? '').toLowerCase();
    const status = rawStatus === 'completed' ? 'COMPLETED'
      : ['pending', 'processing'].includes(rawStatus) ? 'PENDING'
      : ['failed', 'reversed', 'cancelled', 'canceled'].includes(rawStatus) ? 'FAILED' : 'UNKNOWN';
    return {
      provider: String(row?.source ?? row?.provider ?? 'links.et').toLowerCase(), transactionId,
      status, amountMinor, currency: String(row?.currency ?? 'ETB').toUpperCase(),
      paidAt: parseProviderDate(row?.paymentDate ?? row?.paidAt ?? row?.paid_at),
      receiverAccount: firstString(row, ['creditedPartyAccountNo', 'receiverAccount', 'receiverPhone', 'recipientAccount']),
      receiverName: firstString(row, ['creditedPartyName', 'receiverName', 'recipientName']),
      mode: 'LIVE', raw: data,
    };
  }
}
function firstString(obj: any, keys: string[]): string | null {
  for (const key of keys) if (typeof obj?.[key] === 'string' && obj[key].trim()) return obj[key].trim();
  return null;
}
