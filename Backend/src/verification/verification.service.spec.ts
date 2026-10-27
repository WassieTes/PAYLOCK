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

    // 1. Ingest image buffer via ReceiptProcessorService if uploaded
    if (input.fileBuffer && this.receiptProcessor) {
      const extracted = await this.receiptProcessor.processReceiptImage(input.fileBuffer);
      if (extracted) {
        visualHash = extracted.visualHash || null;
        extractedAmount = extracted.amount != null ? Number(extracted.amount) : null;
        if (extracted.provider && extracted.provider !== 'unknown') {
          detectedProvider = extracted.provider;
        }
        if (!txnRef && extracted.reference) {
          txnRef = extracted.reference.trim();
        }
      }
    }

    // 2. Check for prior verified record in the database
    if (txnRef) {
      const existing = await this.verificationRepo.findOne({
        where: {
          transactionReference: txnRef,
          status: VerificationStatus.VERIFIED,
        },
      });

      if (existing) {
        const existingSettledAmount =
          existing.settledAmount != null ? Number(existing.settledAmount) : null;
        const isSameOrder =
          existing.merchantId === merchantId && existing.orderId === orderId;

        if (isSameOrder) {
          // Verify that order requirements have not changed
          const amountMatches =
            existingSettledAmount != null &&
            Math.abs(existingSettledAmount - Number(expectedAmount)) < 0.01;
          const receiverMatches =
            !existing.settledReceiver ||
            existing.settledReceiver === expectedReceiver ||
            existing.settledReceiver.includes(expectedReceiver) ||
            expectedReceiver.includes(existing.settledReceiver);

          if (!amountMatches) {
            return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
              transactionReference: txnRef,
              visualHash,
              extractedAmount,
              settledAmount: existingSettledAmount,
              settledReceiver: existing.settledReceiver,
              providerName: existing.providerName,
              status: VerificationStatus.MISMATCH,
              reason: `Settled amount (${existingSettledAmount} ETB) does not match order requirements which requires ${expectedAmount} ETB.`,
            });
          }

          if (!receiverMatches) {
            return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
              transactionReference: txnRef,
              visualHash,
              extractedAmount,
              settledAmount: existingSettledAmount,
              settledReceiver: existing.settledReceiver,
              providerName: existing.providerName,
              status: VerificationStatus.MISMATCH,
              reason: `Receiver mismatch: Settled receiver was ${existing.settledReceiver}, but expected ${expectedReceiver}.`,
            });
          }

          // Idempotent replay of previously confirmed verification
          return {
            id: existing.id,
            orderId: existing.orderId,
            status: existing.status,
            canReleaseOrder: true,
            transactionId: existing.transactionReference,
            settledAmount: existingSettledAmount,
            extractedAmount:
              existing.extractedAmount != null ? Number(existing.extractedAmount) : null,
            provider: existing.providerName,
            reason: existing.reason || 'Order already verified.',
            createdAt: existing.createdAt,
          };
        }

        // Fraud detection: Reference reused across different orders
        return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
          transactionReference: txnRef,
          visualHash,
          extractedAmount,
          settledAmount: existingSettledAmount,
          providerName: existing.providerName,
          status: VerificationStatus.DUPLICATE_CLAIM,
          reason: `This transaction reference (${txnRef}) was already claimed on order ${existing.orderId}.`,
        });
      }
    }

    // 3. Provider Configuration Check
    const apiKey = process.env.LINKSET_API_KEY;
    if (!apiKey) {
      return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
        transactionReference: txnRef || null,
        visualHash,
        extractedAmount,
        providerName: detectedProvider,
        status: VerificationStatus.PENDING_PROVIDER,
        settledAmount: null,
        reason: 'Payment provider is not configured. Check LINKSET_API_KEY setting.',
      });
    }

    if (!txnRef && !input.receiptUrl?.trim()) {
      return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
        visualHash,
        extractedAmount,
        providerName: detectedProvider,
        status: VerificationStatus.REVIEW_REQUIRED,
        reason: 'Could not extract a readable transaction reference or receipt URL.',
      });
    }

    // 4. Query Authoritative Ledger (links.et)
    const requestUrl = new URL(
      process.env.LINKSET_VERIFY_URL || 'https://links.et/api/verify',
    );

    const requestBody = input.receiptUrl?.trim()
      ? JSON.stringify({ url: input.receiptUrl.trim() })
      : JSON.stringify({ reference: txnRef });

    let response: Response;
    let data: any = null;

    try {
      response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          accept: 'application/json',
        },
        body: requestBody,
      });

      data = await response.json().catch(() => null);
    } catch (fetchError) {
      return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
        transactionReference: txnRef || null,
        visualHash,
        extractedAmount,
        providerName: detectedProvider,
        status: VerificationStatus.PENDING_PROVIDER,
        settledAmount: null,
        reason: 'Network error connecting to payment provider. Verification pending.',
      });
    }

    // 5. Handle HTTP 404 Discrepancy (Missing Provider Endpoint vs. Not Found Transaction)
    if (response.status === 404) {
      if (
        data?.error?.code === 'transaction_not_found' ||
        data?.code === 'transaction_not_found'
      ) {
        return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
          transactionReference: txnRef || null,
          visualHash,
          extractedAmount,
          providerName: detectedProvider,
          status: VerificationStatus.NOT_FOUND,
          settledAmount: null,
          reason: data?.error?.message || 'Transaction reference not found by provider.',
        });
      }

      return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
        transactionReference: txnRef || null,
        visualHash,
        extractedAmount,
        providerName: detectedProvider,
        status: VerificationStatus.PENDING_PROVIDER,
        settledAmount: null,
        reason:
          'Payment verification endpoint returned HTTP 404. Check LINKSET_VERIFY_URL; no payment was confirmed.',
      });
    }

    // 6. Handle Provider Rejection or Non-OK Status Codes
    if (!response.ok || data?.ok === false) {
      let rawError =
        data?.error?.message ||
        data?.message ||
        `Provider returned status ${response.status}`;

      if (input.receiptUrl) {
        rawError = rawError.split(input.receiptUrl).join('[receipt url]');
      }
      rawError = rawError.replace(/https?:\/\/[^\s]+/g, '[receipt url]');

      return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
        transactionReference: txnRef || null,
        visualHash,
        extractedAmount,
        providerName: detectedProvider,
        status: VerificationStatus.PENDING_PROVIDER,
        settledAmount: null,
        reason: `Provider error: ${rawError}`,
      });
    }

    // 7. Parse Authoritative Receipt Payload
    const receipt = data?.receipt || {};
    const providerName =
      data.providerKey || receipt.provider || detectedProvider || 'cbe';
    const transactionId =
      receipt.reference ||
      receipt.receiptNo ||
      receipt.transactionId ||
      txnRef ||
      null;

    const rawSettled =
      receipt.settledAmount ?? receipt.transferredAmount ?? receipt.amount;
    const settledAmount = this.parseMoney(rawSettled);

    const settledReceiver = String(
      receipt.receiverAccount ??
        receipt.creditedPartyAccountNo ??
        receipt.creditedAccount ??
        receipt.receiver ??
        '',
    ).trim();

    // 8. Masked Account Protection
    if (settledReceiver.includes('*')) {
      return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
        transactionReference: transactionId,
        visualHash,
        extractedAmount,
        settledAmount,
        settledReceiver,
        providerName,
        status: VerificationStatus.REVIEW_REQUIRED,
        reason:
          'The provider masked the receiver account; manual review is required.',
      });
    }

    // 9. Reconciliation Rules: Amount & Receiver Matching
    const amountMatches =
      settledAmount != null &&
      Math.abs(settledAmount - Number(expectedAmount)) < 0.01;

    const receiverMatches = Boolean(
      settledReceiver &&
        (settledReceiver === expectedReceiver ||
          settledReceiver.includes(expectedReceiver) ||
          expectedReceiver.includes(settledReceiver)),
    );

    if (!amountMatches) {
      return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
        transactionReference: transactionId,
        visualHash,
        extractedAmount,
        settledAmount,
        settledReceiver,
        providerName,
        status: VerificationStatus.MISMATCH,
        reason: `Amount mismatch: Settled amount is ${settledAmount} ETB, but order requires ${expectedAmount} ETB.`,
      });
    }

    if (!receiverMatches) {
      return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
        transactionReference: transactionId,
        visualHash,
        extractedAmount,
        settledAmount,
        settledReceiver,
        providerName,
        status: VerificationStatus.MISMATCH,
        reason: `Receiver mismatch: Settled receiver was ${settledReceiver}, but expected merchant account ${expectedReceiver}.`,
      });
    }

    // 10. Verification Confirmed: Order Approved for Release
    return this.saveAndReturn(merchantId, orderId, expectedAmount, expectedReceiver, {
      transactionReference: transactionId,
      visualHash,
      extractedAmount,
      settledAmount,
      settledReceiver,
      providerName,
      status: VerificationStatus.VERIFIED,
      reason: 'Transaction confirmed via authoritative banking records.',
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
      settledAmount:
        record.settledAmount != null ? Number(record.settledAmount) : null,
      extractedAmount:
        record.extractedAmount != null ? Number(record.extractedAmount) : null,
      provider: record.providerName || null,
      reason: record.reason || null,
      createdAt: record.createdAt,
    };
  }

  private parseMoney(val: unknown): number | null {
    if (typeof val === 'number') {
      return isNaN(val) ? null : val;
    }
    if (typeof val === 'string') {
      const match = val.replace(/,/g, '').match(/([0-9]+(?:\.[0-9]+)?)/);
      if (match) {
        const num = parseFloat(match[1]);
        return isNaN(num) ? null : num;
      }
    }
    return null;
  }

  async getRecentVerifications(merchantId: string) {
    return this.verificationRepo.find({
      where: { merchantId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }
}