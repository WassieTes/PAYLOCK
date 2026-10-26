import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from './entities/merchant.entity';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
  ) {}

  async getProfile(merchantId: string) {
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant account not found.');
    }

    return {
      id: merchant.id,
      businessName: merchant.businessName,
      email: merchant.email,
      businessType: merchant.businessType,
      industry: merchant.industry,
      phone: merchant.phone,
      websiteUrl: merchant.websiteUrl,
      accountStatus: merchant.accountStatus,
      createdAt: merchant.createdAt,
      updatedAt: merchant.updatedAt,
    };
  }
  

  async updateProfile(merchantId: string, dto: UpdateMerchantDto) {
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant account not found.');
    }

    if (dto.businessName !== undefined) {
      merchant.businessName = dto.businessName.trim();
    }

    if (dto.businessType !== undefined) {
      merchant.businessType = dto.businessType;
    }

    if (dto.industry !== undefined) {
      merchant.industry = dto.industry?.trim() || null;
    }

    if (dto.phone !== undefined) {
      merchant.phone = dto.phone?.trim() || null;
    }

    if (dto.websiteUrl !== undefined) {
      merchant.websiteUrl = dto.websiteUrl?.trim() || null;
    }

    try {
      const updatedMerchant = await this.merchantRepository.save(merchant);

      return {
        message: 'Merchant profile updated successfully.',
        merchant: {
          id: updatedMerchant.id,
          businessName: updatedMerchant.businessName,
          email: updatedMerchant.email,
          businessType: updatedMerchant.businessType,
          industry: updatedMerchant.industry,
          phone: updatedMerchant.phone,
          websiteUrl: updatedMerchant.websiteUrl,
          accountStatus: updatedMerchant.accountStatus,
          createdAt: updatedMerchant.createdAt,
          updatedAt: updatedMerchant.updatedAt,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
