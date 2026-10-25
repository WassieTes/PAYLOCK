import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Merchant, BusinessType } from '../merchants/entities/merchant.entity';
import { RegisterMerchantDto } from './dto/register-merchant.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
  ) {}

  async register(dto: RegisterMerchantDto) {
    const email = dto.email.trim().toLowerCase();

    const existingMerchant = await this.merchantRepository.findOne({
      where: { email },
    });

    if (existingMerchant) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const merchant = this.merchantRepository.create({
      businessName: dto.businessName.trim(),
      email,
      passwordHash,
      businessType: dto.businessType ?? BusinessType.INDIVIDUAL,
      industry: dto.industry?.trim() || null,
      phone: dto.phone?.trim() || null,
      websiteUrl: null,
    });

    const savedMerchant = await this.merchantRepository.save(merchant);

    // Never return the password or its hash.
    const { passwordHash: _passwordHash, ...safeMerchant } = savedMerchant;

    return {
      message: 'Merchant account created successfully.',
      merchant: safeMerchant,
    };
  }
}
