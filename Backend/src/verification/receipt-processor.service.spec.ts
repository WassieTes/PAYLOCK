import { BadRequestException } from '@nestjs/common';
import {
  parseReceiptText,
  ReceiptProcessorService,
} from './receipt-processor.service';

describe('parseReceiptText', () => {
  it('extracts the transferred principal, not browser numbers or receipt fees', () => {
    const text = `
      10:25 64%
      breciept.cbe.com.et
      Payment / Transaction Informations
      Receiver: Kedir Awell Mohammed
      Account: T#+¥20512
      Reference No: FT263007WKV7
      Transferred Amounts. 27 Eehio?" 100.00 ETB
      Service Charge: 0.50 ETB
      VAT (15% of service charge): 0.08 ETB
      Disaster Risk Response Fund (5% of service charge): 0.03 ETB
      Total amount debited from customer's account: 100.61 ETB
      Amount in Word: One Hundred ETB and Sixty One cents
    `;

    expect(parseReceiptText(text)).toEqual({
      reference: 'FT263007WKV7',
      amount: 100,
      receiverAccount: null,
      provider: 'cbe',
    });
  });

  it('extracts an amount from a labeled row when currency formatting uses separators', () => {
    const parsed = parseReceiptText(`
      Telebirr
      Transaction ID: TXN123456789
      Transferred Amount: 1,250.75 ETB
      Service Charge: 4.00 ETB
    `);

    expect(parsed.reference).toBe('TXN123456789');
    expect(parsed.amount).toBe(1250.75);
    expect(parsed.provider).toBe('telebirr');
  });

  it('does not guess an amount from unrelated numbers without an amount label', () => {
    const parsed = parseReceiptText(`
      Date: Oct 27, 2026
      Reference No: FT263007WKV7
      Browser status 10:25 64%
      Account: 1000123456789
    `);

    expect(parsed.reference).toBe('FT263007WKV7');
    expect(parsed.amount).toBeNull();
  });

  it('extracts a complete receiving account from a receiver-labeled row', () => {
    const parsed = parseReceiptText(`
      CBE
      Receiver: Merchant Name
      Account: 1000123456789
      Transferred Amount: 100.00 ETB
    `);

    expect(parsed.receiverAccount).toBe('1000123456789');
  });

  it('rejects empty image data before attempting OCR', async () => {
    await expect(
      new ReceiptProcessorService().processReceiptImage(Buffer.alloc(0)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
