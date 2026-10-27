import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { ApiKey } from './api-key.entity';

@Entity('api_logs')
export class ApiLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'merchant_id', type: 'uuid' })
  merchantId!: string;

  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchant_id' })
  merchant!: Merchant;

  @Column({ name: 'api_key_id', type: 'uuid', nullable: true })
  apiKeyId!: string | null;

  @ManyToOne(() => ApiKey, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'api_key_id' })
  apiKey!: ApiKey | null;

  @Column({ type: 'varchar', length: 20 })
  method!: string;

  @Column({ type: 'varchar', length: 100 })
  endpoint!: string;

  @Column({ name: 'status_code', type: 'int' })
  statusCode!: number;

  @Column({ name: 'outcome', type: 'varchar', length: 50, nullable: true })
  outcome!: string | null;

  @Column({ name: 'order_id', type: 'varchar', length: 100, nullable: true })
  orderId!: string | null;

  @Column({ name: 'latency_ms', type: 'int' })
  latencyMs!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}