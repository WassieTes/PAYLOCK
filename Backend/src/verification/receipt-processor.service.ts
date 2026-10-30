import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';

export interface ExtractedReceiptData {
  rawText: string;
  reference: string | null;
  amount: number | null;
  receiverAccount: string | null;
  provider: 'cbe' | 'telebirr' | 'boa' | 'unknown';
  visualHash: string;
}

interface ParsedReceiptData {
  reference: string | null;
  amount: number | null;
  receiverAccount: string | null;
  provider: 'cbe' | 'telebirr' | 'boa' | 'unknown';
}

const MAX_IMAGE_PIXELS = 40_000_000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const RECEIPT_AMOUNT_LABEL =
  /\b(?:transferred\s+amounts?|amounts?\s+transferred|payment\s+amounts?|transaction\s+amounts?|amounts?\s+paid|paid\s+amounts?|amounts?\s+received|received\s+amounts?)\b/i;
const AMOUNT_TOKEN =
  /(?<![A-Z0-9])((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?)(?![A-Z0-9])/gi;

export function parseReceiptText(text: string): ParsedReceiptData {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const normalizedText = lines.join('\n');

  let provider: ParsedReceiptData['provider'] = 'unknown';
  if (
    /commercial bank of ethiopia|cbe(?:birr)?|receipt\.cbe\.com\.et/i.test(
      normalizedText,
    )
  ) {
    provider = 'cbe';
  } else if (/telebirr|ethio\s*telecom/i.test(normalizedText)) {
    provider = 'telebirr';
  } else if (/bank of abyssinia|abyssinia|\bboa\b/i.test(normalizedText)) {
    provider = 'boa';
  }

  const reference =
    normalizedText.match(/\b(FT[A-Z0-9]{8,14})\b/i)?.[1]?.toUpperCase() ??
    normalizedText
      .match(
        /\b(?:transaction\s*(?:id|no|number)|txn\s*(?:id|no)|ref(?:erence)?\s*(?:no|number))\s*[:#.-]?\s*([A-Z0-9]{8,20})\b/i,
      )?.[1]
      ?.toUpperCase() ??
    null;

  const amount = extractTransferAmount(lines);
  const receiverAccount = extractReceiverAccount(lines);

  if (provider === 'unknown' && reference?.startsWith('FT')) {
    provider = 'cbe';
  }

  return { reference, amount, receiverAccount, provider };
}

function extractTransferAmount(lines: string[]) {
  const preferredIndex = lines.findIndex((line) => RECEIPT_AMOUNT_LABEL.test(line));
  if (preferredIndex >= 0) {
    const sameLineAmount = getLastAmount(lines[preferredIndex]);
    if (sameLineAmount !== null) return sameLineAmount;

    const nextLine = lines[preferredIndex + 1];
    if (nextLine && !/\b(?:fee|charge|tax|vat|total|account|reference)\b/i.test(nextLine)) {
      const nextLineAmount = getLastAmount(nextLine);
      if (nextLineAmount !== null) return nextLineAmount;
    }
  }

  const labeledAmountLines = lines.filter(
    (line) =>
      /\bamount\b/i.test(line) &&
      !/\b(?:service\s+charge|charge|fee|vat|tax|fund|total|debited|in\s+word)\b/i.test(
        line,
      ),
  );
  for (const line of labeledAmountLines) {
    const value = getLastAmount(line);
    if (value !== null) return value;
  }

  const currencyAmountLines = lines.filter((line) =>
    /\b(?:ETB|BIRR)\b/i.test(line),
  );
  for (const line of currencyAmountLines) {
    if (/\b(?:service\s+charge|charge|fee|vat|tax|fund|total|debited)\b/i.test(line)) {
      continue;
    }
    const value = getLastAmount(line);
    if (value !== null) return value;
  }

  return null;
}

function getLastAmount(line: string) {
  const matches = [...line.matchAll(AMOUNT_TOKEN)];
  for (const match of matches.reverse()) {
    const parsed = Number(match[1].replace(/,/g, ''));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function extractReceiverAccount(lines: string[]) {
  const receiverLine = lines.find((line) =>
    /\b(?:receiver|beneficiary|credited\s+to|to\s+account)\b/i.test(line),
  );
  if (!receiverLine) return null;

  const candidates = [receiverLine, lines[lines.indexOf(receiverLine) + 1] ?? ''];
  for (const line of candidates) {
    const match = line.match(
      /\b(?:receiver|beneficiary)?\s*(?:account|a\/c)\s*[:#.-]?\s*((?:\d[\s-]*){10,16})\b/i,
    );
    const digits = match?.[1].replace(/\D/g, '');
    if (digits && digits.length >= 10 && digits.length <= 16) return digits;
  }
  return null;
}

@Injectable()
export class ReceiptProcessorService {
  private readonly logger = new Logger(ReceiptProcessorService.name);

  async processReceiptImage(imageBuffer: Buffer): Promise<ExtractedReceiptData> {
    const optimizedBuffer = await this.optimizeForOCR(imageBuffer);
    const visualHash = await this.generatePerceptualHash(optimizedBuffer);
    const extraction = await this.extractText(optimizedBuffer);

    return {
      rawText: extraction.rawText,
      reference: extraction.parsed.reference,
      amount: extraction.parsed.amount,
      receiverAccount: extraction.parsed.receiverAccount,
      provider: extraction.parsed.provider,
      visualHash,
    };
  }

  private async optimizeForOCR(buffer: Buffer): Promise<Buffer> {
    if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
      throw new BadRequestException('Receipt image must be between 1 byte and 10 MB.');
    }

    try {
      const image = sharp(buffer, {
        failOn: 'error',
        limitInputPixels: MAX_IMAGE_PIXELS,
      });
      const metadata = await image.metadata();
      if (
        !metadata.width ||
        !metadata.height ||
        !['jpeg', 'png', 'webp'].includes(metadata.format ?? '')
      ) {
        throw new BadRequestException('Upload a valid JPEG, PNG, or WEBP receipt image.');
      }

      return await image
        .rotate()
        .resize({ width: 2000, withoutEnlargement: true })
        .flatten({ background: '#ffffff' })
        .grayscale()
        .normalize()
        .sharpen({ sigma: 1 })
        .png()
        .toBuffer();
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.warn('Receipt image could not be decoded or optimized.', error);
      throw new BadRequestException(
        'The uploaded file is not a readable receipt image. Try another image.',
      );
    }
  }

  private async generatePerceptualHash(buffer: Buffer): Promise<string> {
    const rawPixels = await sharp(buffer)
      .grayscale()
      .resize(9, 8, { fit: 'fill' })
      .raw()
      .toBuffer();

    let hash = '';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const left = rawPixels[row * 9 + col];
        const right = rawPixels[row * 9 + col + 1];
        hash += left > right ? '1' : '0';
      }
    }
    return BigInt(`0b${hash}`).toString(16).padStart(16, '0');
  }

  private async extractText(buffer: Buffer): Promise<{
    rawText: string;
    parsed: ParsedReceiptData;
  }> {
    let worker: Awaited<ReturnType<typeof createWorker>> | undefined;
    try {
      worker = await createWorker('eng');
      await worker.setParameters({
        preserve_interword_spaces: '1',
        user_defined_dpi: '300',
      });
      const { data: firstPass } = await worker.recognize(buffer);
      const firstParsed = parseReceiptText(firstPass.text);
      if (
        firstParsed.amount !== null &&
        firstParsed.reference !== null &&
        firstParsed.provider !== 'unknown'
      ) {
        return { rawText: firstPass.text, parsed: firstParsed };
      }

      const retryBuffer = await sharp(buffer).normalize().threshold(175).png().toBuffer();
      const { data: secondPass } = await worker.recognize(retryBuffer);
      const secondParsed = parseReceiptText(secondPass.text);
      const parsed: ParsedReceiptData = {
        reference: firstParsed.reference ?? secondParsed.reference,
        amount: firstParsed.amount ?? secondParsed.amount,
        receiverAccount: firstParsed.receiverAccount ?? secondParsed.receiverAccount,
        provider:
          firstParsed.provider !== 'unknown'
            ? firstParsed.provider
            : secondParsed.provider,
      };
      const rawText = [firstPass.text, secondPass.text]
        .filter((text) => text.trim())
        .join('\n');

      if (!rawText) {
        throw new BadRequestException(
          'No readable text was found in the receipt. Upload a clearer image.',
        );
      }
      return { rawText, parsed };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Receipt OCR failed.', error);
      throw new BadRequestException(
        'The receipt could not be read. Try a clearer image or enter the transaction reference manually.',
      );
    } finally {
      await worker?.terminate();
    }
  }
}
