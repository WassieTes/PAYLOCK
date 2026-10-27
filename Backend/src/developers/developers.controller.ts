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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerificationEngineService } from '../person2/verification-engine.service';

@Controller()
export class DevelopersController {
  constructor(
    private readonly devService: DevelopersService,
    private readonly verificationService: VerificationEngineService,
  ) { }

  // ==================== DASHBOARD MANAGEMENT ====================
  @UseGuards(JwtAuthGuard)
  @Get('dashboard/keys')
  async getKeys(@Req() req: any) {
    const merchantId = req.user?.merchantId;
    return this.devService.listKeys(merchantId);

  }
  @UseGuards(JwtAuthGuard)
  @Post('dashboard/keys')
  async generateKey(@Req() req: any, @Body('name') name: string) {
    const merchantId = req.user?.merchantId;
    return this.devService.createKey(merchantId, name);
  }
  @UseGuards(JwtAuthGuard)
  @Delete('dashboard/keys/:id')
  async revokeKey(@Req() req: any, @Param('id') id: string) {
    const merchantId = req.user?.merchantId;
    return this.devService.revokeKey(merchantId, id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('dashboard/logs')
  async getLogs(@Req() req: any) {
    const merchantId = req.user?.merchantId;
    return this.devService.getLogs(merchantId);
  }

  // ==================== PUBLIC VERIFICATION API ====================


  @Post('verify')
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(FileInterceptor('receipt'))
  async verifyPayment(
    @Req() req: any,
    @Body() body: any,
    @UploadedFile() file?: unknown,
  ) {
    const startTime = Date.now();
    const orderId =
      typeof body.orderId === 'string' && body.orderId.trim()
        ? body.orderId.trim()
        : `ORD-${Date.now()}`;

    const expectedAmount = body.expectedAmount;
    const expectedReceiver =
      typeof body.expectedReceiver === 'string'
        ? body.expectedReceiver
        : '';

    const reference =
      typeof body.reference === 'string' ? body.reference.trim() : '';

    const receiptUrl =
      typeof body.receiptUrl === 'string' ? body.receiptUrl.trim() : '';

    if (
      expectedAmount === undefined ||
      expectedAmount === null ||
      String(expectedAmount).trim() === '' ||
      !expectedReceiver.trim()
    ) {
      throw new BadRequestException(
        'expectedAmount and expectedReceiver are required.',
      );
    }

    const outcome = await this.verificationService.verify({
      orderId,
      expectedAmount,
      expectedReceiver,
      reference: reference || undefined,
      receiptUrl: receiptUrl || undefined,
      hasReceiptFile: Boolean(file),
      orderCreatedAt:
        typeof body.orderCreatedAt === 'string'
          ? body.orderCreatedAt
          : undefined,
    });

    const latency = Date.now() - startTime;

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

    return {
      success: true,
      orderId,
      result: {
        status: outcome.status,
        canReleaseOrder: outcome.canReleaseOrder,
        details: {
          transactionId: outcome.transactionId,
          settledAmount: outcome.settledAmount,
          currency: outcome.currency,
          provider: outcome.provider,
          mode: outcome.mode,
          verifiedAt: outcome.verifiedAt,
          message: outcome.message,
          reasons: outcome.reasons,
        },
      },
    };
  }
}