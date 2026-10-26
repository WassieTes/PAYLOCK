import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import {
  Merchant,
  BusinessType,
  MerchantStatus,
} from '../merchants/entities/merchant.entity';

import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { LoginMerchantDto } from './dto/login-merchant.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    private readonly jwtService: JwtService,
  ) {}

  // Register a new merchant
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

  // Log in an existing merchant
  async login(dto: LoginMerchantDto) {
    const email = dto.email.trim().toLowerCase();

    // passwordHash has select: false, so explicitly select it for verification.
    const merchant = await this.merchantRepository
      .createQueryBuilder('merchant')
      .addSelect('merchant.passwordHash')
      .where('merchant.email = :email', { email })
      .getOne();

    if (!merchant) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      merchant.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (merchant.accountStatus !== MerchantStatus.ACTIVE) {
      throw new ForbiddenException('This merchant account is suspended.');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: merchant.id,
      email: merchant.email,
    });

    return {
      message: 'Login successful.',
      accessToken,
      tokenType: 'Bearer',
      expiresIn: '15m',
      merchant: {
        id: merchant.id,
        businessName: merchant.businessName,
        email: merchant.email,
        businessType: merchant.businessType,
        accountStatus: merchant.accountStatus,
      },
    };
  }
}
