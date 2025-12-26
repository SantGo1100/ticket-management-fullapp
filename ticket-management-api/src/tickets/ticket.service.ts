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
import { TopicService } from '../topics/topic.service';

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
    private readonly topicService: TopicService,
  ) {}

  /**
   * Get topic name for a ticket
   * Returns topic.name if topic exists, otherwise topicNameSnapshot
   */
  private getTopicName(ticket: Ticket): string | null {
    if (ticket.topic) {
      return ticket.topic.name;
    }
    return ticket.topicNameSnapshot;
  }

  /**
   * Enrich ticket with topicName field for API responses
   */
  private enrichTicketWithTopicName(ticket: Ticket): any {
    const ticketObj = ticket as any;
    ticketObj.topicName = this.getTopicName(ticket);
    return ticketObj;
  }

  /**
   * Create a new ticket
   * Business Rule: Tickets always start with status "created"
   */
  async createTicket(createTicketDto: CreateTicketDto): Promise<Ticket> {
    // Validate that the topic exists and is active
    const topic = await this.topicService.findActiveById(createTicketDto.topic_id);
    if (!topic) {
      throw new BadRequestException(
        `Topic with ID ${createTicketDto.topic_id} not found or is not active`,
      );
    }

    try {
      const ticket = this.ticketRepository.create({
        requesterId: createTicketDto.requester_id,
        requesterName: createTicketDto.requester_name || null,
        assigneeId: createTicketDto.assignee_id ?? null,
        topicId: createTicketDto.topic_id,
        topicNameSnapshot: topic.name, // Persist topic name at creation time
        priority: createTicketDto.priority,
        description: createTicketDto.description,
        status: TicketStatus.CREATED, // Always start with "created"
      });

      const savedTicket = await this.ticketRepository.save(ticket);
      
      // Load topic relation for response
      const ticketWithTopic = await this.ticketRepository.findOne({
        where: { ticketId: savedTicket.ticketId },
        relations: ['topic'],
      }) || savedTicket;

      // Enrich with topicName for API response
      return this.enrichTicketWithTopicName(ticketWithTopic);
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
    const queryBuilder = this.ticketRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.topic', 'topic');

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

    const tickets = await queryBuilder.getMany();
    
    // Enrich all tickets with topicName
    return tickets.map(ticket => this.enrichTicketWithTopicName(ticket));
  }

  /**
   * Find a ticket by ID
   */
  async findById(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { ticketId: id },
      relations: ['topic'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    // Enrich with topicName for API response
    return this.enrichTicketWithTopicName(ticket);
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
    // Get ticket without enrichment first (to avoid double enrichment)
    const ticket = await this.ticketRepository.findOne({
      where: { ticketId: id },
      relations: ['topic'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

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

    const savedTicket = await this.ticketRepository.save(ticket);
    
    // Reload with topic relation
    const ticketWithTopic = await this.ticketRepository.findOne({
      where: { ticketId: savedTicket.ticketId },
      relations: ['topic'],
    }) || savedTicket;

    // Enrich with topicName for API response
    return this.enrichTicketWithTopicName(ticketWithTopic);
  }

  /**
   * Finalize ticket (set status to completed)
   */
  async finalizeTicket(id: number): Promise<Ticket> {
    // Get ticket without enrichment first (to avoid double enrichment)
    const ticket = await this.ticketRepository.findOne({
      where: { ticketId: id },
      relations: ['topic'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

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
    const savedTicket = await this.ticketRepository.save(ticket);
    
    // Reload with topic relation
    const ticketWithTopic = await this.ticketRepository.findOne({
      where: { ticketId: savedTicket.ticketId },
      relations: ['topic'],
    }) || savedTicket;

    // Enrich with topicName for API response
    return this.enrichTicketWithTopicName(ticketWithTopic);
  }
}


