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
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { DevelopersService } from './developers.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { VerificationService } from '../verification/verification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

type AuthenticatedRequest = Request & {
  user: {
    merchantId: string;
  };
};

@Controller()
export class DevelopersController {
  constructor(
    private readonly devService: DevelopersService,
    private readonly verificationService: VerificationService,
  ) {}

  // ==================== DASHBOARD MANAGEMENT ====================

  @Get('dashboard/keys')
  @UseGuards(JwtAuthGuard)
  async getKeys(@Req() req: AuthenticatedRequest) {
    return this.devService.listKeys(req.user.merchantId);
  }

  @Post('dashboard/keys')
  @UseGuards(JwtAuthGuard)
  async generateKey(@Req() req: AuthenticatedRequest, @Body('name') name: string) {
    return this.devService.createKey(req.user.merchantId, name);
  }

  @Delete('dashboard/keys/:id')
  @UseGuards(JwtAuthGuard)
  async revokeKey(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.devService.revokeKey(req.user.merchantId, id);
  }

  @Get('dashboard/logs')
  @UseGuards(JwtAuthGuard)
  async getLogs(@Req() req: AuthenticatedRequest) {
    return this.devService.getLogs(req.user.merchantId);
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