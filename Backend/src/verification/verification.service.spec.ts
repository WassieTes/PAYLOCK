import { Repository } from 'typeorm';
import { Verification, VerificationStatus } from './entities/verification.entity';
import { ReceiptProcessorService } from './receipt-processor.service';
import { VerificationService } from './verification.service';

describe('VerificationService', () => {
  const originalApiKey = process.env.LINKSET_API_KEY;
  const originalVerifyUrl = process.env.LINKSET_VERIFY_URL;
  const fetchMock = jest.spyOn(global, 'fetch');

  const repositoryMock = {
    findOne: jest.fn(),
    create: jest.fn((record: Partial<Verification>) => ({
      ...record,
      id: 'verification-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    })),
    save: jest.fn(async (record: Verification) => record),
  };
  const receiptProcessorMock = {
    processReceiptImage: jest.fn(),
  };

  let service: VerificationService;

  beforeEach(() => {
    process.env.LINKSET_API_KEY = 'test-api-key';
    process.env.LINKSET_VERIFY_URL = 'https://provider.example/api/verify';
    fetchMock.mockReset();
    repositoryMock.findOne.mockReset().mockResolvedValue(null);
    repositoryMock.create.mockClear();
    repositoryMock.save.mockClear();
    receiptProcessorMock.processReceiptImage.mockReset().mockResolvedValue({
      rawText: 'Transfer 100 ETB to account 1000123456789',
      reference: 'FT1234567890',
      amount: 100,
      receiverAccount: '1000123456789',
      provider: 'cbe',
      visualHash: 'receipt-hash',
    });

    service = new VerificationService(
      repositoryMock as unknown as Repository<Verification>,
      receiptProcessorMock as unknown as ReceiptProcessorService,
    );
  });

  afterAll(() => {
    fetchMock.mockRestore();
    if (originalApiKey === undefined) {
      delete process.env.LINKSET_API_KEY;
    } else {
      process.env.LINKSET_API_KEY = originalApiKey;
    }

    if (originalVerifyUrl === undefined) {
      delete process.env.LINKSET_VERIFY_URL;
    } else {
      process.env.LINKSET_VERIFY_URL = originalVerifyUrl;
    }
  });

  it('does not release an order on provider endpoint 404, even when OCR values match', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await service.verify({
      merchantId: 'merchant-1',
      orderId: 'order-1',
      expectedAmount: 100,
      expectedReceiver: '1000123456789',
      fileBuffer: Buffer.from('receipt'),
    });

    expect(result.status).toBe(VerificationStatus.PENDING_PROVIDER);
    expect(result.canReleaseOrder).toBe(false);
    expect(result.reason).toContain('LINKSET_VERIFY_URL');
    expect(repositoryMock.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: VerificationStatus.PENDING_PROVIDER }),
    );
  });

  it('keeps extracted receipt amount separate from settled amount when provider returns 502', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Bad Gateway' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await service.verify({
      merchantId: 'merchant-1',
      orderId: 'order-1',
      expectedAmount: 100,
      expectedReceiver: '1000123456789',
      fileBuffer: Buffer.from('receipt'),
    });

    expect(result.status).toBe(VerificationStatus.PENDING_PROVIDER);
    expect(result.canReleaseOrder).toBe(false);
    expect(result.extractedAmount).toBe(100);
    expect(result.settledAmount).toBeNull();
    expect(result.reason).toContain('HTTP 502 (Bad Gateway)');
  });

  it('looks up CBE FT references with the last 8 digits of the expected receiver account', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          receipt: {
            reference: 'FT1234567890',
            transferredAmount: 100,
            receiverAccount: '1000123456789',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    await service.verify({
      merchantId: 'merchant-1',
      orderId: 'order-1',
      expectedAmount: 100,
      expectedReceiver: '1000123456789',
      reference: 'FT1234567890',
    });

    const requestOptions = fetchMock.mock.calls[0]?.[1];
    expect(requestOptions?.body).toBe(
      JSON.stringify({
        url: 'https://apps.cbe.com.et:100/?id=FT123456789023456789',
      }),
    );
  });

  it('does not send an incomplete CBE FT lookup when the account has fewer than 8 digits', async () => {
    const result = await service.verify({
      merchantId: 'merchant-1',
      orderId: 'order-1',
      expectedAmount: 100,
      expectedReceiver: '1234567',
      reference: 'FT1234567890',
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.status).toBe(VerificationStatus.PENDING_PROVIDER);
    expect(result.canReleaseOrder).toBe(false);
    expect(result.reason).toContain('at least 8 digits');
  });

  it('allows release when the provider confirms a completed transfer matching the order', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          receipt: {
            status: 'successful',
            reference: 'FT1234567890',
            transferredAmount: 100,
            receiverAccount: '1000123456789',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const result = await service.verify({
      merchantId: 'merchant-1',
      orderId: 'order-1',
      expectedAmount: 100,
      expectedReceiver: '1000123456789',
      reference: 'FT1234567890',
    });

    expect(result.status).toBe(VerificationStatus.VERIFIED);
    expect(result.canReleaseOrder).toBe(true);
    expect(result.settledAmount).toBe(100);
  });

  it('allows release when all visible digits of a masked receiver match the order and OCR account', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          receipt: {
            status: 'successful',
            reference: 'FT1234567890',
            transferredAmount: 100,
            receiverAccount: '1****0337',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    receiptProcessorMock.processReceiptImage.mockResolvedValueOnce({
      rawText: 'Transfer 100 ETB to account 100012340337',
      reference: 'FT1234567890',
      amount: 100,
      receiverAccount: '100012340337',
      provider: 'cbe',
      visualHash: 'receipt-hash',
    });

    const result = await service.verify({
      merchantId: 'merchant-1',
      orderId: 'order-1',
      expectedAmount: 100,
      expectedReceiver: '100012340337',
      fileBuffer: Buffer.from('receipt'),
    });

    expect(result.status).toBe(VerificationStatus.VERIFIED);
    expect(result.canReleaseOrder).toBe(true);
    expect(result.reason).toContain('visible digits');
    expect(result.reason).toContain('account extracted from the receipt');
    expect(repositoryMock.save).toHaveBeenCalledWith(
      expect.objectContaining({ settledReceiver: '1****0337' }),
    );
  });

  it('does not release when a visible digit in the masked receiver does not match', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          receipt: {
            status: 'successful',
            reference: 'FT1234567890',
            transferredAmount: 100,
            receiverAccount: '1****0000',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const result = await service.verify({
      merchantId: 'merchant-1',
      orderId: 'order-1',
      expectedAmount: 100,
      expectedReceiver: '1000123456789',
      reference: 'FT1234567890',
    });

    expect(result.status).toBe(VerificationStatus.MISMATCH);
    expect(result.canReleaseOrder).toBe(false);
  });
});
