import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey } from '../entities/api-key.entity';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const rawHeader = request.headers['authorization'] || request.headers['x-api-key'];

    if (!rawHeader) {
      throw new UnauthorizedException('API key missing from Authorization or X-API-Key header');
    }

    const token = typeof rawHeader === 'string' && rawHeader.startsWith('Bearer ')
      ? rawHeader.slice(7).trim()
      : String(rawHeader).trim();

    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    const keyRecord = await this.apiKeyRepo.findOne({
      where: { keyHash: hashed, isActive: true },
      relations: { merchant: true },
    });

    if (!keyRecord) {
      throw new UnauthorizedException('Invalid, revoked, or inactive API key');
    }

    // Attach merchant and key metadata to the request
    request.merchant = keyRecord.merchant;
    request.apiKey = keyRecord;

    // Asynchronously record last used timestamp
    this.apiKeyRepo.update(keyRecord.id, { lastUsedAt: new Date() }).catch(() => {});

    return true;
  }
}