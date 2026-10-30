import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerificationService } from './verification.service';

type AuthenticatedRequest = Request & {
  user: {
    merchantId: string;
  };
};

@Controller('verifications')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('manual')
  @UseInterceptors(
    FileInterceptor('receipt', {
      limits: { fileSize: 10 * 1024 * 1024, files: 1 },
    }),
  )
  async manualVerify(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, string | undefined>,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp)$/i,
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024, // 10 MB
        })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file?: { buffer: Buffer; originalname: string },
  ) {
    const expectedAmount = Number(body.expectedAmount);
    const expectedReceiver = body.expectedReceiver?.trim();
    const orderId = body.orderId?.trim();
    const receiptUrl = body.receiptUrl?.trim();

    if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) {
      throw new BadRequestException('A valid expectedAmount is required.');
    }
    if (!expectedReceiver) {
      throw new BadRequestException('An expectedReceiver is required.');
    }
    if (!orderId) {
      throw new BadRequestException('An orderId is required.');
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

    return this.verificationService.verify({
      merchantId: req.user.merchantId,
      orderId,
      expectedAmount,
      expectedReceiver,
      reference: body.reference,
      receiptUrl,
      fileBuffer: file?.buffer,
      fileName: file?.originalname,
    });
  }

  @Get()
  getVerifications(@Req() req: AuthenticatedRequest) {
    return this.verificationService.getRecentVerifications(req.user.merchantId);
  }

  @Get('recent')
  getRecent(@Req() req: AuthenticatedRequest) {
    return this.verificationService.getRecentVerifications(req.user.merchantId);
  }
}