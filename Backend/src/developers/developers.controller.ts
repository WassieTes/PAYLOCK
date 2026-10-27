import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DevelopersService } from './developers.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { VerificationService } from '../verification/verification.service';

@Controller()
export class DevelopersController {
  constructor(
    private readonly devService: DevelopersService,
    private readonly verificationService: VerificationService,
  ) {}

  // ==================== DASHBOARD MANAGEMENT ====================

  @Get('dashboard/keys')
  async getKeys(@Req() req: any) {
    const merchantId = req.user?.id || req.user?.merchantId;
    return this.devService.listKeys(merchantId);
  }

  @Post('dashboard/keys')
  async generateKey(@Req() req: any, @Body('name') name: string) {
    const merchantId = req.user?.id || req.user?.merchantId;
    return this.devService.createKey(merchantId, name);
  }

  @Delete('dashboard/keys/:id')
  async revokeKey(@Req() req: any, @Param('id') id: string) {
    const merchantId = req.user?.id || req.user?.merchantId;
    return this.devService.revokeKey(merchantId, id);
  }

  @Get('dashboard/logs')
  async getLogs(@Req() req: any) {
    const merchantId = req.user?.id || req.user?.merchantId;
    return this.devService.getLogs(merchantId);
  }

  // ==================== PUBLIC VERIFICATION API ====================

  @Post('verify')
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(FileInterceptor('receipt'))
  async verifyPayment(
    @Req() req: any,
    @Body() body: any,
    @UploadedFile() file?: any,
  ) {
    const startTime = Date.now();
    const orderId = body.orderId || `ORD-${Date.now()}`;
    const expectedAmount = parseFloat(body.expectedAmount);
    const expectedReceiver = body.expectedReceiver;
    const reference =
      typeof body.reference === 'string' ? body.reference.trim() : undefined;
    const rawReceiptUrl =
      typeof body.receiptUrl === 'string'
        ? body.receiptUrl
        : typeof body.url === 'string'
          ? body.url
          : undefined;
    const receiptUrl = rawReceiptUrl?.trim();

    if (!expectedAmount || !expectedReceiver) {
      throw new BadRequestException('expectedAmount and expectedReceiver are required.');
    }

    if (!file && !reference && !receiptUrl) {
      throw new BadRequestException(
        'Provide a receipt image, transaction reference, or receipt URL.',
      );
    }

    if (receiptUrl) {
      try {
        const parsedReceiptUrl = new URL(receiptUrl);
        if (
          parsedReceiptUrl.protocol !== 'https:' ||
          parsedReceiptUrl.username ||
          parsedReceiptUrl.password
        ) {
          throw new BadRequestException(
            'Receipt URL must be an HTTPS link without embedded credentials.',
          );
        }
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        throw new BadRequestException('Enter a valid HTTPS receipt URL.');
      }
    }

    // Call the core shared verification engine
    const outcome = await this.verificationService.verify({
      merchantId: req.merchant.id,
      orderId,
      expectedAmount,
      expectedReceiver,
      reference,
      receiptUrl,
      fileBuffer: file?.buffer,
      fileName: file?.originalname,
    });

    const latency = Date.now() - startTime;

    // Record incoming API usage
    await this.devService.recordLog({
      merchantId: req.merchant.id,
      apiKeyId: req.apiKey.id,
      method: 'POST',
      endpoint: '/api/v1/verify',
      statusCode: 200,
      outcome: outcome.status,
      orderId,
      latencyMs: latency,
    });

    // Return the authoritative verification response
    return {
      success: true,
      orderId,
      result: {
        status: outcome.status,
        canReleaseOrder: outcome.canReleaseOrder,
        details: {
          transactionId: outcome.transactionId || null,
          settledAmount: outcome.settledAmount || null,
          currency: 'ETB',
          provider: outcome.provider || null,
          verifiedAt: outcome.createdAt || new Date().toISOString(),
          message: outcome.reason,
        },
      },
    };
  }
}