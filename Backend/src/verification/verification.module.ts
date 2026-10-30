import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Verification } from './entities/verification.entity';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { ReceiptProcessorService } from './receipt-processor.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Verification]), AuthModule],
  controllers: [VerificationController],
  providers: [VerificationService, ReceiptProcessorService],
  exports: [VerificationService, ReceiptProcessorService],
})
export class VerificationModule {}