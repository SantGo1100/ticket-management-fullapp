import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { TicketStatus } from '../entities/enums/ticket.enums';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

export interface FindAllFilters {
  status?: TicketStatus;
  requester_id?: number;
  requester_name?: string;
  assignee_id?: number;
}

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  /**
   * Create a new ticket
   * Business Rule: Tickets always start with status "created"
   */
  async createTicket(createTicketDto: CreateTicketDto): Promise<Ticket> {
    try {
      const ticket = this.ticketRepository.create({
        requesterId: createTicketDto.requester_id,
        requesterName: createTicketDto.requester_name || null,
        assigneeId: createTicketDto.assignee_id ?? null,
        topic: createTicketDto.topic,
        priority: createTicketDto.priority,
        description: createTicketDto.description,
        status: TicketStatus.CREATED, // Always start with "created"
      });

      return await this.ticketRepository.save(ticket);
    } catch (error) {
      // Log the error for debugging
      console.error('Error creating ticket:', error);
      
      // Re-throw with more context if it's a database error
      if (error.code === 'SQLITE_ERROR' || error.message?.includes('no such column')) {
        throw new Error(
          'Database schema mismatch. Please restart the backend server to synchronize the database schema.'
        );
      }
      
      throw error;
    }
  }

  /**
   * Find all tickets with optional filters
   */
  async findAll(filters?: FindAllFilters): Promise<Ticket[]> {
    const queryBuilder = this.ticketRepository.createQueryBuilder('ticket');

    if (filters?.status) {
      queryBuilder.andWhere('ticket.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.requester_id) {
      queryBuilder.andWhere('ticket.requesterId = :requesterId', {
        requesterId: filters.requester_id,
      });
    }

    if (filters?.requester_name) {
      queryBuilder.andWhere('ticket.requesterName = :requesterName', {
        requesterName: filters.requester_name,
      });
    }

    if (filters?.assignee_id) {
      queryBuilder.andWhere('ticket.assigneeId = :assigneeId', {
        assigneeId: filters.assignee_id,
      });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Find a ticket by ID
   */
  async findById(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { ticketId: id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  /**
   * Validate status transition rules
   */
  private validateStatusTransition(
    currentStatus: TicketStatus,
    newStatus: TicketStatus,
    assigneeId: number | null,
  ): void {
    // Allowed transitions: created → in_progress, in_progress → completed
    if (currentStatus === TicketStatus.CREATED) {
      if (newStatus === TicketStatus.IN_PROGRESS) {
        // To move to "in_progress", assignee_id must be defined
        if (!assigneeId) {
          throw new BadRequestException(
            'Assignee ID must be provided to move ticket to "in_progress" status',
          );
        }
      } else if (newStatus === TicketStatus.COMPLETED) {
        throw new BadRequestException(
          'Cannot transition from "created" to "completed". Ticket must be "in_progress" first.',
        );
      } else if (newStatus === TicketStatus.CREATED) {
        // No-op: staying in created status
        return;
      } else {
        throw new BadRequestException(
          `Invalid status transition from "${currentStatus}" to "${newStatus}"`,
        );
      }
    } else if (currentStatus === TicketStatus.IN_PROGRESS) {
      if (newStatus === TicketStatus.COMPLETED) {
        // Valid transition
        return;
      } else if (newStatus === TicketStatus.IN_PROGRESS) {
        // No-op: staying in in_progress status
        return;
      } else {
        throw new BadRequestException(
          `Invalid status transition from "${currentStatus}" to "${newStatus}". Only "completed" is allowed.`,
        );
      }
    } else if (currentStatus === TicketStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot change status of a completed ticket',
      );
    }
  }

  /**
   * Update ticket (assign user or change status)
   */
  async updateTicket(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findById(id);

    // Handle assignee update
    if (updateTicketDto.assignee_id !== undefined) {
      ticket.assigneeId = updateTicketDto.assignee_id;
    }

    // Handle status update with validation
    if (updateTicketDto.status !== undefined) {
      this.validateStatusTransition(
        ticket.status,
        updateTicketDto.status,
        ticket.assigneeId ?? updateTicketDto.assignee_id ?? null,
      );
      ticket.status = updateTicketDto.status;
    }

    return await this.ticketRepository.save(ticket);
  }

  /**
   * Finalize ticket (set status to completed)
   */
  async finalizeTicket(id: number): Promise<Ticket> {
    const ticket = await this.findById(id);

    // Validate that ticket can be finalized
    if (ticket.status === TicketStatus.COMPLETED) {
      throw new BadRequestException('Ticket is already completed');
    }

    if (ticket.status !== TicketStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Cannot finalize ticket with status "${ticket.status}". Ticket must be "in_progress" to be finalized.`,
      );
    }

    ticket.status = TicketStatus.COMPLETED;
    return await this.ticketRepository.save(ticket);
  }
}


