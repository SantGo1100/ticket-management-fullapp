import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TicketPriority, TicketStatus } from './enums/ticket.enums';
import { Topic } from './topic.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn({ name: 'ticket_id' })
  ticketId: number;

  @Column({ name: 'requester_id', type: 'integer' })
  requesterId: number;

  @Column({ name: 'requester_name', type: 'varchar', length: 255, nullable: true, default: null })
  requesterName: string | null;

  @Column({ name: 'assignee_id', type: 'integer', nullable: true })
  assigneeId: number | null;

  @Column({ name: 'topic_id', type: 'integer', nullable: true })
  topicId: number | null;

  @ManyToOne(() => Topic, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'topic_id' })
  topic: Topic | null;

  @Column({ name: 'topic_name_snapshot', type: 'varchar', length: 100, nullable: true })
  topicNameSnapshot: string | null;

  @Column({
    type: 'varchar',
    length: 10,
    enum: TicketPriority,
  })
  priority: TicketPriority;

  @Column({
    type: 'varchar',
    length: 20,
    enum: TicketStatus,
    default: TicketStatus.CREATED,
  })
  status: TicketStatus;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}


