import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from './entities/api-key.entity';
import { ApiLog } from './entities/api-log.entity';
import { DevelopersService } from './developers.service';
import { DevelopersController } from './developers.controller';
import { ApiKeyGuard } from './guards/api-key.guard';
import { VerificationModule } from '../verification/verification.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey, ApiLog]),
    VerificationModule,
    AuthModule,
  ],
  controllers: [DevelopersController],
  providers: [DevelopersService, ApiKeyGuard],
  exports: [DevelopersService, ApiKeyGuard],
})
export class DevelopersModule {}