import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TicketTopic, TicketPriority, TicketStatus } from './enums/ticket.enums';

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

  @Column({
    type: 'varchar',
    length: 20,
    enum: TicketTopic,
  })
  topic: TicketTopic;

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


