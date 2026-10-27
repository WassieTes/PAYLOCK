import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';

export enum VerificationStatus {
  VERIFIED = 'VERIFIED',
  MISMATCH = 'MISMATCH',
  DUPLICATE_CLAIM = 'DUPLICATE_CLAIM',
  NOT_FOUND = 'NOT_FOUND',
  PENDING_PROVIDER = 'PENDING_PROVIDER',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
}

@Entity('verifications')
export class Verification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'merchant_id', type: 'uuid' })
  merchantId!: string;

  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchant_id' })
  merchant!: Merchant;

  @Column({ name: 'order_id', type: 'varchar', length: 100 })
  orderId!: string;

  @Index()
  @Column({ name: 'transaction_reference', type: 'varchar', length: 150, nullable: true })
  transactionReference!: string | null;

  @Index()
  @Column({ name: 'visual_hash', type: 'varchar', length: 64, nullable: true })
  visualHash!: string | null;

  @Column({ name: 'expected_amount', type: 'decimal', precision: 12, scale: 2 })
  expectedAmount!: number;

  @Column({ name: 'settled_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  settledAmount!: number | null;

  @Column({ name: 'extracted_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  extractedAmount!: number | null;

  @Column({ name: 'expected_receiver', type: 'varchar', length: 100 })
  expectedReceiver!: string;

  @Column({ name: 'settled_receiver', type: 'varchar', length: 100, nullable: true })
  settledReceiver!: string | null;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING_PROVIDER,
  })
  status!: VerificationStatus;

  @Column({ name: 'provider_name', type: 'varchar', length: 50, nullable: true })
  providerName!: string | null;

  @Column({ name: 'receipt_image_path', type: 'varchar', length: 255, nullable: true })
  receiptImagePath!: string | null;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}