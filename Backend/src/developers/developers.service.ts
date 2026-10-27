import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey } from './entities/api-key.entity';
import { ApiLog } from './entities/api-log.entity';

@Injectable()
export class DevelopersService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
    @InjectRepository(ApiLog)
    private readonly apiLogRepo: Repository<ApiLog>,
  ) {}

  async listKeys(merchantId: string) {
    return this.apiKeyRepo.find({
      where: { merchantId },
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        isActive: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
  }

  async createKey(merchantId: string, name: string) {
    const secret = crypto.randomBytes(24).toString('hex');
    const rawKey = `pl_live_${secret}`;
    const keyPrefix = `${rawKey.substring(0, 14)}...`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = this.apiKeyRepo.create({
      merchantId,
      name: name?.trim() || 'Production Store Key',
      keyPrefix,
      keyHash,
      isActive: true,
    });

    await this.apiKeyRepo.save(apiKey);

    return {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      rawKey, // Shown only once to the merchant
      createdAt: apiKey.createdAt,
    };
  }

  async revokeKey(merchantId: string, keyId: string) {
    const key = await this.apiKeyRepo.findOne({ where: { id: keyId, merchantId } });
    if (!key) throw new NotFoundException('API Key not found');
    key.isActive = false;
    return this.apiKeyRepo.save(key);
  }

  async getLogs(merchantId: string, limit = 20) {
    return this.apiLogRepo.find({
      where: { merchantId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async recordLog(data: {
    merchantId: string;
    apiKeyId: string | null;
    method: string;
    endpoint: string;
    statusCode: number;
    outcome?: string;
    orderId?: string;
    latencyMs: number;
  }) {
    const log = this.apiLogRepo.create(data);
    return this.apiLogRepo.save(log);
  }
}