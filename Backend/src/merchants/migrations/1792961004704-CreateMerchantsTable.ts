import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMerchantsTable1792961004704 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."merchants_business_type_enum"
      AS ENUM (
        'individual',
        'sole_proprietorship',
        'company',
        'other'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."merchants_account_status_enum"
      AS ENUM (
        'active',
        'suspended'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "merchants" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "business_name" varchar(150) NOT NULL,
        "email" varchar(255) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "business_type" "public"."merchants_business_type_enum"
          NOT NULL DEFAULT 'individual',
        "industry" varchar(100),
        "phone" varchar(30),
        "website_url" varchar(255),
        "account_status" "public"."merchants_account_status_enum"
          NOT NULL DEFAULT 'active',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),

        CONSTRAINT "PK_merchants_id"
          PRIMARY KEY ("id"),

        CONSTRAINT "UQ_merchants_email"
          UNIQUE ("email")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "merchants"
    `);

    await queryRunner.query(`
      DROP TYPE "public"."merchants_account_status_enum"
    `);

    await queryRunner.query(`
      DROP TYPE "public"."merchants_business_type_enum"
    `);
  }
}
