import { Controller, Get, Req, UseGuards, Body, Patch } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MerchantsService } from './merchants.service';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

type AuthenticatedRequest = Request & {
  user: {
    merchantId: string;
    email: string;
  };
};

@Controller('merchants')
@UseGuards(JwtAuthGuard)
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.merchantsService.getProfile(req.user.merchantId);
  }

  @Patch('profile')
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateMerchantDto,
  ) {
    return this.merchantsService.updateProfile(req.user.merchantId, dto);
  }
}
