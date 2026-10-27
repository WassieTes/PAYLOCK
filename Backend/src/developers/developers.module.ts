
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKey } from './entities/api-key.entity';
import { ApiLog } from './entities/api-log.entity';
import { DevelopersService } from './developers.service';
import { DevelopersController } from './developers.controller';
import { ApiKeyGuard } from './guards/api-key.guard';

import { PaymentClaim } from '../person2/entities/payment-claim.entity';
import { VerificationEngineService } from '../person2/verification-engine.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApiKey,
      ApiLog,
      PaymentClaim,
    ]),
  ],
  controllers: [DevelopersController],
  providers: [
    DevelopersService,
    ApiKeyGuard,
    VerificationEngineService,
  ],
  exports: [
    DevelopersService,
    ApiKeyGuard,
    VerificationEngineService,
  ],
})
export class DevelopersModule { }
