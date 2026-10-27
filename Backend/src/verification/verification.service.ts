import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Verification, VerificationStatus } from './entities/verification.entity';
import { ReceiptProcessorService } from './receipt-processor.service';

export interface VerifyInput {
  merchantId: string;
  orderId: string;
  expectedAmount: number;
  expectedReceiver: string;
  reference?: string;
  receiptUrl?: string;
  fileBuffer?: Buffer;
  fileName?: string; 
}

type ProviderLookupResult =
  | {
      status: 'found';
      amount: number;
      receiver: string;
      provider: string;
      reference: string | null;
    }
  | { status: 'not_found' }
  | { status: 'unavailable'; reason: string };

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function parseProviderAmount(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return Number.NaN;

  const match = value.match(/-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?/);
  return match ? Number(match[0].replace(/,/g, '')) : Number.NaN;
}

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(Verification)
    private readonly verificationRepo: Repository<Verification>,
    private readonly receiptProcessor: ReceiptProcessorService,
  ) {}

  async verify(input: VerifyInput) {
    const { merchantId, orderId, expectedAmount, expectedReceiver } = input;
    let txnRef = input.reference?.trim() || null;
    let visualHash: string | null = null;
    let extractedAmount: number | null = null;
    let detectedProvider: string | null = null;

    // 1. Process Receipt Image if an upload buffer is present
    if (input.fileBuffer) {
      const extracted = await this.receiptProcessor.processReceiptImage(input.fileBuffer);
      visualHash = extracted.visualHash;
      extractedAmount = extracted.amount;
      detectedProvider = extracted.provider !== 'unknown' ? extracted.provider : null;

      // Visual Deduplication: Detect recycled screenshot images
      if (visualHash) {
        const visualDuplicate = await this.verificationRepo.findOne({
          where: {
            visualHash,
            status: VerificationStatus.VERIFIED,
          },
        });

        if (visualDuplicate && visualDuplicate.orderId !== orderId) {
          return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
            transactionReference: visualDuplicate.transactionReference,
            visualHash,
            extractedAmount,
            providerName: detectedProvider,
            status: VerificationStatus.DUPLICATE_CLAIM,
            reason: `Visual fingerprint matches a receipt already used for order ${visualDuplicate.orderId}.`,
          });
        }
      }

      // If reference was not explicitly typed by user, use the OCR-extracted reference
      if (!txnRef && extracted.reference) {
        txnRef = extracted.reference;
      }
    }

    // 2. A full receipt URL can identify a transaction without a typed reference.
    if (!txnRef && !input.receiptUrl) {
      return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
        visualHash,
        extractedAmount,
        providerName: detectedProvider,
        status: VerificationStatus.REVIEW_REQUIRED,
        reason: 'Enter a transaction reference, provide a receipt URL, or upload a receipt with a readable reference.',
      });
    }

    // 3. Reference-Level Anti-Recycling & Idempotency Check
    if (txnRef) {
      const existingResult = await this.checkExistingReference(
        merchantId,
        orderId,
        expectedAmount,
        expectedReceiver,
        txnRef,
        visualHash,
        extractedAmount,
        detectedProvider,
      );
      if (existingResult) return existingResult;
    }

    // 4. Query the authoritative payment ledger.
    const upstream = await this.queryUpstreamProvider(txnRef, input.receiptUrl);

    if (upstream.status === 'unavailable') {
      return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
        transactionReference: txnRef,
        visualHash,
        extractedAmount,
        providerName: detectedProvider,
        status: VerificationStatus.PENDING_PROVIDER,
        reason: upstream.reason,
      });
    }

    if (upstream.status === 'not_found') {
      return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
        transactionReference: txnRef,
        visualHash,
        extractedAmount,
        providerName: detectedProvider,
        status: VerificationStatus.NOT_FOUND,
        reason: 'Transaction reference not found in bank ledger records.',
      });
    }

    const verifiedReference = upstream.reference || txnRef;
    if (!verifiedReference) {
      return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
        visualHash,
        extractedAmount,
        providerName: upstream.provider || detectedProvider,
        status: VerificationStatus.PENDING_PROVIDER,
        reason: 'The provider returned payment details without a transaction reference. No payment was confirmed.',
      });
    }

    if (verifiedReference !== txnRef) {
      const existingResult = await this.checkExistingReference(
        merchantId,
        orderId,
        expectedAmount,
        expectedReceiver,
        verifiedReference,
        visualHash,
        extractedAmount,
        detectedProvider,
      );
      if (existingResult) return existingResult;
    }

    // 5. Decision Engine: Compare Expected Order vs Authoritative Ledger Settled Data
    const provider = upstream.provider || detectedProvider || 'unknown';
    const amountMatches = Math.abs(Number(upstream.amount) - Number(expectedAmount)) < 0.01;
    const receiverMatches =
      this.normalizeReceiver(upstream.receiver) ===
        this.normalizeReceiver(expectedReceiver) &&
      this.normalizeReceiver(expectedReceiver).length > 0;

    if (!amountMatches) {
      return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
        transactionReference: verifiedReference,
        visualHash,
        extractedAmount,
        settledAmount: upstream.amount,
        settledReceiver: upstream.receiver,
        providerName: provider,
        status: VerificationStatus.MISMATCH,
        reason: `Amount mismatch: Settled bank transfer is ${upstream.amount} ETB, but order requires ${expectedAmount} ETB.`,
      });
    }

    if (/[*xX•]{2,}/.test(upstream.receiver)) {
      return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
        transactionReference: verifiedReference,
        visualHash,
        extractedAmount,
        settledAmount: upstream.amount,
        settledReceiver: upstream.receiver,
        providerName: provider,
        status: VerificationStatus.REVIEW_REQUIRED,
        reason: `The provider confirmed the payment amount but masked the receiver account (${upstream.receiver}), so PAYLOCK cannot safely confirm it matches the merchant account.`,
      });
    }

    if (!receiverMatches) {
      return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
        transactionReference: verifiedReference,
        visualHash,
        extractedAmount,
        settledAmount: upstream.amount,
        settledReceiver: upstream.receiver,
        providerName: provider,
        status: VerificationStatus.MISMATCH,
        reason: `Receiver mismatch: Transferred to ${upstream.receiver}, expected merchant account ${expectedReceiver}.`,
      });
    }

    // 6. Confirmed Match: Order is fully safe to release
    return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
      transactionReference: verifiedReference,
      visualHash,
      extractedAmount,
      settledAmount: upstream.amount,
      settledReceiver: upstream.receiver,
      providerName: provider,
      status: VerificationStatus.VERIFIED,
      reason: 'Transaction verified against authoritative banking ledger.',
    });
  }

  private async checkExistingReference(
    merchantId: string,
    orderId: string,
    expectedAmount: number,
    expectedReceiver: string,
    reference: string,
    visualHash: string | null,
    extractedAmount: number | null,
    detectedProvider: string | null,
  ) {
    const existingRef = await this.verificationRepo.findOne({
      where: {
        transactionReference: reference,
        status: VerificationStatus.VERIFIED,
      },
    });

    if (!existingRef) return null;

    if (existingRef.merchantId === merchantId && existingRef.orderId === orderId) {
      const existingAmount = Number(existingRef.settledAmount);
      const amountMatches =
        Number.isFinite(existingAmount) &&
        Math.abs(existingAmount - expectedAmount) < 0.01;
      const receiverMatches =
        this.normalizeReceiver(existingRef.settledReceiver || '') ===
          this.normalizeReceiver(expectedReceiver) &&
        this.normalizeReceiver(expectedReceiver).length > 0;

      if (amountMatches && receiverMatches) {
        return {
          id: existingRef.id,
          orderId: existingRef.orderId,
          status: existingRef.status,
          canReleaseOrder: true,
          transactionId: existingRef.transactionReference,
          settledAmount: existingAmount,
          extractedAmount: existingRef.extractedAmount
            ? Number(existingRef.extractedAmount)
            : null,
          provider: existingRef.providerName,
          reason: 'Order already verified (idempotent replay).',
          createdAt: existingRef.createdAt,
        };
      }

      return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
        transactionReference: reference,
        visualHash,
        extractedAmount,
        settledAmount: existingRef.settledAmount,
        settledReceiver: existingRef.settledReceiver,
        providerName: existingRef.providerName,
        status: VerificationStatus.MISMATCH,
        reason: !amountMatches
          ? `Amount mismatch: Settled bank transfer is ${existingRef.settledAmount} ETB, but order requires ${expectedAmount} ETB.`
          : `Receiver mismatch: Transferred to ${existingRef.settledReceiver}, expected merchant account ${expectedReceiver}.`,
      });
    }

    return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
      transactionReference: reference,
      visualHash,
      extractedAmount,
      providerName: existingRef.providerName || detectedProvider,
      status: VerificationStatus.DUPLICATE_CLAIM,
      reason: `Transaction reference ${reference} was already claimed on order ${existingRef.orderId}.`,
    });
  }

  private async saveAndReturn(
    merchantId: string,
    orderId: string,
    expectedAmount: number,
    expectedReceiver: string,
    result: Partial<Verification>,
  ) {
    const record = this.verificationRepo.create({
      merchantId,
      orderId,
      expectedAmount,
      expectedReceiver,
      ...result,
    });

    await this.verificationRepo.save(record);

    return {
      id: record.id,
      orderId: record.orderId,
      status: record.status,
      canReleaseOrder: record.status === VerificationStatus.VERIFIED,
      transactionId: record.transactionReference || null,
      settledAmount: record.settledAmount ? Number(record.settledAmount) : null,
      extractedAmount: record.extractedAmount ? Number(record.extractedAmount) : null,
      provider: record.providerName || null,
      reason: record.reason || null,
      createdAt: record.createdAt,
    };
  }

  private normalizeReceiver(value: string) {
    return value.replace(/\D/g, '');
  }

  private async queryUpstreamProvider(
    reference: string | null,
    receiptUrl?: string,
  ): Promise<ProviderLookupResult> {
    const apiKey = process.env.LINKSET_API_KEY;
    const verifyUrl =
      process.env.LINKSET_VERIFY_URL ||
      'https://links.et/api/verify';

    if (!apiKey) {
      return {
        status: 'unavailable',
        reason: 'Payment provider is not configured. No ledger verification was performed.',
      };
    }

    if (apiKey) {
      try {
        const url = new URL(verifyUrl);
        if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
          return {
            status: 'unavailable',
            reason: 'Payment provider URL must use HTTPS. No ledger verification was performed.',
          };
        }
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify(
            receiptUrl ? { url: receiptUrl } : { reference },
          ),
          signal: AbortSignal.timeout(125_000),
        });
        const payload: unknown = await res.json().catch(() => null);
        const data = isRecord(payload) ? payload : null;
        const error = data && isRecord(data.error) ? data.error : null;
        const errorCode = typeof error?.code === 'string' ? error.code : '';
        const safeErrorCode =
          typeof error?.code === 'string'
            ? error.code.replace(/[^a-z0-9_-]/gi, '').slice(0, 40)
            : '';
        if (
          ['not_found', 'receipt_not_found', 'transaction_not_found'].includes(
            errorCode.toLowerCase(),
          )
        ) {
          return { status: 'not_found' };
        }
        if (res.status === 404) {
          return {
            status: 'unavailable',
            reason: 'links.et returned HTTP 404. Check LINKSET_VERIFY_URL; no payment was confirmed.',
          };
        }
        if (!res.ok) {
          const reason =
            res.status === 401
              ? 'links.et rejected the API key. Check LINKSET_API_KEY; no payment was confirmed.'
              : res.status === 429
                ? 'links.et rate or plan limit reached. Check the Retry-After response before retrying; no payment was confirmed.'
                : !receiptUrl &&
                    reference?.toUpperCase().startsWith('FT') &&
                    errorCode === 'invalid_request'
                  ? 'links.et requires a full receipt URL to verify CBE FT references. Enter the receipt link; no payment was confirmed.'
                  : `links.et could not verify this receipt (HTTP ${res.status}${safeErrorCode ? `, ${safeErrorCode}` : ''}). No payment was confirmed.`;
          return {
            status: 'unavailable',
            reason,
          };
        }

        if (!data || data.ok !== true || !isRecord(data.receipt)) {
          return {
            status: 'unavailable',
            reason: `links.et returned no confirmed receipt${safeErrorCode ? ` (${safeErrorCode})` : ''}. No ledger verification was performed.`,
          };
        }

        const receipt = data.receipt;
        const transaction = isRecord(receipt.transaction)
          ? receipt.transaction
          : {};
        const amount = parseProviderAmount(
          receipt.transferredAmount ??
            receipt.settledAmount ??
            receipt.amount ??
            receipt.creditAmount ??
            transaction.amount,
        );
        const receiver = firstString(
          receipt.receiverAccount,
          receipt.creditedPartyAccountNo,
          receipt.recipientAccount,
          receipt.recipientAccountNo,
          receipt.beneficiaryAccount,
          receipt.receiver,
          transaction.beneficiaryAccount,
          transaction.receiverAccount,
        );
        const transactionStatus = firstString(
          receipt.transactionStatus,
          receipt.upstreamStatus,
          receipt.status,
          transaction.transactionStatus,
          transaction.status,
        );
        if (transactionStatus) {
          const normalizedStatus = transactionStatus.toLowerCase();
          if (/\bnot[\s_-]?found\b/.test(normalizedStatus)) {
            return { status: 'not_found' };
          }
          if (
            /failed|rejected|cancelled|canceled|reversed|pending|processing|incomplete|unsuccessful/.test(
              normalizedStatus,
            )
          ) {
            return {
              status: 'unavailable',
              reason: `The provider receipt is not a completed payment (${transactionStatus}). No payment was confirmed.`,
            };
          }
          if (
            !/\b(completed|success|successful|paid|settled|approved)\b/.test(
              normalizedStatus,
            )
          ) {
            return {
              status: 'unavailable',
              reason: `The provider receipt is not in a completed payment state (${transactionStatus}). No payment was confirmed.`,
            };
          }
        }

        const provider = firstString(data.providerKey, receipt.source) || 'unknown';
        const providerReference = firstString(
          receipt.reference,
          receipt.receiptNo,
          receipt.transactionReference,
          receipt.transactionId,
          receipt.invoiceNo,
          transaction.reference,
          transaction.transactionId,
        );
        if (!Number.isFinite(amount) || amount <= 0 || !receiver) {
          return {
            status: 'unavailable',
            reason:
              'links.et returned a receipt without a usable amount or receiver account. No payment was confirmed.',
          };
        }
        return {
          status: 'found',
          amount,
          receiver,
          provider,
          reference: providerReference,
        };
      } catch (err) {
        const reason =
          err instanceof Error && err.name === 'TimeoutError'
            ? 'The links.et verification request timed out. No payment was confirmed.'
            : 'Could not reach the links.et verification service. No payment was confirmed.';
        return { status: 'unavailable', reason };
      }
    }

    return {
      status: 'unavailable',
      reason: 'Payment provider could not verify this reference. No ledger verification was performed.',
    };
  }

  async getRecentVerifications(merchantId: string) {
    return this.verificationRepo.find({
      where: { merchantId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }
}