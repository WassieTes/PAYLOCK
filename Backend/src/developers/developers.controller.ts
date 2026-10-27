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

@Controller('api/v1')
export class DevelopersController {
  constructor(private readonly devService: DevelopersService) {}

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
    @UploadedFile() file?: unknown,
  ) {
    const startTime = Date.now();
    const orderId = body.orderId || `ORD-${Date.now()}`;
    const expectedAmount = parseFloat(body.expectedAmount);
    const expectedReceiver = body.expectedReceiver;
    const reference = body.reference || body.receiptUrl;

    if (!expectedAmount || !expectedReceiver) {
      throw new BadRequestException('expectedAmount and expectedReceiver are required.');
    }

    if (!file && !reference) {
      throw new BadRequestException('Provide either a receipt image or reference number.');
    }

    // Call Person 2's verification engine here once ready:
    // const outcome = await this.verificationService.verify(...)

    // Deterministic mock scenarios for hackathon testing:
    let status = 'VERIFIED';
    let message = 'Transaction verified against authoritative banking ledger.';

    if (reference === 'TEST_DUPLICATE' || reference === 'FT_DUPLICATE') {
      status = 'DUPLICATE_CLAIM';
      message = 'Transaction ID has already been claimed on another order.';
    } else if (expectedAmount > 5000) {
      status = 'MISMATCH';
      message = 'Settled transaction amount does not match expected order total.';
    }

    const latency = Date.now() - startTime;

    await this.devService.recordLog({
      merchantId: req.merchant.id,
      apiKeyId: req.apiKey.id,
      method: 'POST',
      endpoint: '/api/v1/verify',
      statusCode: 200,
      outcome: status,
      orderId,
      latencyMs: latency,
    });

    return {
      success: true,
      orderId,
      result: {
        status,
        canReleaseOrder: status === 'VERIFIED',
        details: {
          transactionId: reference || 'FT26294KLS90',
          settledAmount: expectedAmount,
          currency: 'ETB',
          provider: 'cbe',
          verifiedAt: new Date().toISOString(),
          message,
        },
      },
    };
  }
}