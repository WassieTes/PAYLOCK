import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** Unique provider + transaction ID prevents the same settlement being claimed by two orders. */
@Entity('paylock_payment_claims')
@Index('UQ_paylock_payment_claim_provider_transaction', ['provider', 'transactionId'], { unique: true })
export class PaymentClaim {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 80 }) provider!: string;
  @Column({ name: 'transaction_id', type: 'varchar', length: 200 }) transactionId!: string;
  @Column({ name: 'order_id', type: 'varchar', length: 200 }) orderId!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
