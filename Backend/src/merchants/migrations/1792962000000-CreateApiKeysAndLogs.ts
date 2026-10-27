import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApiKeysAndLogs1792962000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "api_keys" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "merchant_id" UUID NOT NULL REFERENCES "merchants"("id") ON DELETE CASCADE,
        "name" VARCHAR(100) NOT NULL,
        "key_prefix" VARCHAR(25) NOT NULL,
        "key_hash" VARCHAR(64) NOT NULL UNIQUE,
        "is_active" BOOLEAN DEFAULT true,
        "last_used_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "api_logs" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "merchant_id" UUID NOT NULL REFERENCES "merchants"("id") ON DELETE CASCADE,
        "api_key_id" UUID REFERENCES "api_keys"("id") ON DELETE SET NULL,
        "method" VARCHAR(20) NOT NULL,
        "endpoint" VARCHAR(100) NOT NULL,
        "status_code" INT NOT NULL,
        "outcome" VARCHAR(50),
        "order_id" VARCHAR(100),
        "latency_ms" INT NOT NULL,
        "created_at" TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "api_logs";
      DROP TABLE IF EXISTS "api_keys";
    `);
  }
}