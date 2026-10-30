import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVerificationsTable1792963000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."verifications_status_enum" AS ENUM (
          'VERIFIED',
          'MISMATCH',
          'DUPLICATE_CLAIM',
          'NOT_FOUND',
          'PENDING_PROVIDER',
          'REVIEW_REQUIRED'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS "verifications" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "merchant_id" UUID NOT NULL REFERENCES "merchants"("id") ON DELETE CASCADE,
        "order_id" VARCHAR(100) NOT NULL,
        "transaction_reference" VARCHAR(150),
        "expected_amount" DECIMAL(12, 2) NOT NULL,
        "settled_amount" DECIMAL(12, 2),
        "expected_receiver" VARCHAR(100) NOT NULL,
        "settled_receiver" VARCHAR(100),
        "status" "public"."verifications_status_enum" DEFAULT 'PENDING_PROVIDER',
        "provider_name" VARCHAR(50),
        "receipt_image_path" VARCHAR(255),
        "reason" TEXT,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS "idx_verifications_reference" ON "verifications" ("transaction_reference");
      CREATE INDEX IF NOT EXISTS "idx_verifications_merchant_order" ON "verifications" ("merchant_id", "order_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "verifications";
      DROP TYPE IF EXISTS "public"."verifications_status_enum";
    `);
  }
}