import { BadRequestException } from '@nestjs/common';
import { validateReceiptUpload } from './receipt-prevalidation';

describe('receipt upload pre-validation', () => {
  it('accepts a PNG with matching MIME and signature', () => {
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    expect(() => validateReceiptUpload({ mimetype: 'image/png', size: buffer.length, buffer })).not.toThrow();
  });
  it('rejects a MIME/signature mismatch', () => {
    const buffer = Buffer.from('not a png');
    expect(() => validateReceiptUpload({ mimetype: 'image/png', size: buffer.length, buffer })).toThrow(BadRequestException);
  });
  it('rejects an oversized image', () => {
    const buffer = Buffer.alloc(5 * 1024 * 1024 + 1);
    expect(() => validateReceiptUpload({ mimetype: 'image/jpeg', size: buffer.length, buffer })).toThrow(BadRequestException);
  });
});
