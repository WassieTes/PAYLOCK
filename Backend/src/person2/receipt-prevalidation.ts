import { BadRequestException } from '@nestjs/common';

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Validate upload metadata and file signature. This does not read OCR or establish payment truth. */
export function validateReceiptUpload(file: unknown): void {
  if (!file) return;
  const upload = file as { mimetype?: unknown; size?: unknown; buffer?: unknown };
  if (!Buffer.isBuffer(upload.buffer)) throw new BadRequestException('Receipt upload is missing its file bytes.');
  if (typeof upload.size !== 'number' || upload.size <= 0 || upload.size > MAX_RECEIPT_BYTES || upload.buffer.length > MAX_RECEIPT_BYTES) {
    throw new BadRequestException('Receipt image must be between 1 byte and 5 MB.');
  }
  const mime = typeof upload.mimetype === 'string' ? upload.mimetype.toLowerCase() : '';
  const png = mime === 'image/png' && upload.buffer.length >= PNG_SIGNATURE.length && upload.buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE);
  const jpeg = mime === 'image/jpeg' && upload.buffer.length >= 3 && upload.buffer[0] === 0xff && upload.buffer[1] === 0xd8 && upload.buffer[2] === 0xff;
  if (!png && !jpeg) throw new BadRequestException('Receipt must be a valid PNG or JPEG image.');
}
export const MAX_RECEIPT_BYTES_LIMIT = MAX_RECEIPT_BYTES;
