import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiKey } from './api-key.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'sid', type: 'varchar', length: 255, unique: true })
  sid: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => ApiKey, (apiKey) => apiKey.account)
  apiKeys: ApiKey[];
}

