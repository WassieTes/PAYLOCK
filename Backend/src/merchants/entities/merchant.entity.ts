import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BusinessType {
  INDIVIDUAL = 'individual',
  SOLE_PROPRIETORSHIP = 'sole_proprietorship',
  COMPANY = 'company',
  OTHER = 'other',
}

export enum MerchantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'business_name', type: 'varchar', length: 150 })
  businessName!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    select: false,
  })
  passwordHash!: string;

  @Column({
    name: 'business_type',
    type: 'enum',
    enum: BusinessType,
    default: BusinessType.INDIVIDUAL,
  })
  businessType!: BusinessType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  industry!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone!: string | null;

  @Column({
    name: 'website_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  websiteUrl!: string | null;

  @Column({
    name: 'account_status',
    type: 'enum',
    enum: MerchantStatus,
    default: MerchantStatus.ACTIVE,
  })
  accountStatus!: MerchantStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
