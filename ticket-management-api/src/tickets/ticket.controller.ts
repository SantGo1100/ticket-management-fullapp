import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';
import { TicketService, FindAllFilters } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { FindAllQueryDto } from './dto/find-all-query.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Tickets')
@Controller()
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get('health')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
      },
    },
  })
  getHealth() {
    return { ok: true };
  }

  @Post('tickets')
  @ApiSecurity('x-account-sid')
  @ApiSecurity('x-api-key')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new ticket',
    description: 'Creates a new support ticket. Tickets always start with status "created". Requires x-account-sid and x-api-key headers.',
  })
  @ApiBody({ type: CreateTicketDto })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    schema: {
      type: 'object',
      properties: {
        ticketId: { type: 'number', example: 1 },
        requesterId: { type: 'number', example: 1 },
        requesterName: { type: 'string', example: 'John Doe' },
        assigneeId: { type: 'number', nullable: true, example: 2 },
        topic: { type: 'string', enum: ['billing', 'bug', 'feature', 'other'], example: 'bug' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
        status: { type: 'string', enum: ['created', 'in_progress', 'completed'], example: 'created' },
        description: { type: 'string', example: 'User is experiencing a login issue' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async createTicket(@Body() createTicketDto: CreateTicketDto) {
    return await this.ticketService.createTicket(createTicketDto);
  }

  @Get('tickets')
  @ApiSecurity('x-account-sid')
  @ApiSecurity('x-api-key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all tickets',
    description: 'Retrieves a list of all tickets with optional filtering by status, requester_id, requester_name, or assignee_id. Requires x-account-sid and x-api-key headers.',
  })
  @ApiQuery({ name: 'status', required: false, enum: ['created', 'in_progress', 'completed'] })
  @ApiQuery({ name: 'requester_id', required: false, type: Number })
  @ApiQuery({ name: 'requester_name', required: false, type: String })
  @ApiQuery({ name: 'assignee_id', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of tickets retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ticketId: { type: 'number', example: 1 },
          requesterId: { type: 'number', example: 1 },
          requesterName: { type: 'string', example: 'John Doe' },
          assigneeId: { type: 'number', nullable: true, example: 2 },
          topic: { type: 'string', enum: ['billing', 'bug', 'feature', 'other'], example: 'bug' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
          status: { type: 'string', enum: ['created', 'in_progress', 'completed'], example: 'in_progress' },
          description: { type: 'string', example: 'User is experiencing a login issue' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findAll(@Query() query: FindAllQueryDto) {
    const filters: FindAllFilters = {
      ...(query.status && { status: query.status }),
      ...(query.requester_id && { requester_id: query.requester_id }),
      ...(query.requester_name && { requester_name: query.requester_name }),
      ...(query.assignee_id && { assignee_id: query.assignee_id }),
    };
    return await this.ticketService.findAll(filters);
  }

  @Get('tickets/:id')
  @ApiSecurity('x-account-sid')
  @ApiSecurity('x-api-key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get ticket by ID',
    description: 'Retrieves a single ticket by its ID. Requires x-account-sid and x-api-key headers.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Ticket ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        ticketId: { type: 'number', example: 1 },
        requesterId: { type: 'number', example: 1 },
        assigneeId: { type: 'number', nullable: true, example: 2 },
        topic: { type: 'string', enum: ['billing', 'bug', 'feature', 'other'], example: 'bug' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
        status: { type: 'string', enum: ['created', 'in_progress', 'completed'], example: 'in_progress' },
        description: { type: 'string', example: 'User is experiencing a login issue' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.ticketService.findById(id);
  }

  @Patch('tickets/:id')
  @ApiSecurity('x-account-sid')
  @ApiSecurity('x-api-key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update ticket',
    description: 'Updates a ticket\'s assignee_id and/or status. Status transitions must follow business rules: created → in_progress (requires assignee_id), in_progress → completed. Requires x-account-sid and x-api-key headers.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Ticket ID',
    example: 1,
  })
  @ApiBody({ type: UpdateTicketDto })
  @ApiResponse({
    status: 200,
    description: 'Ticket updated successfully',
    schema: {
      type: 'object',
      properties: {
        ticketId: { type: 'number', example: 1 },
        requesterId: { type: 'number', example: 1 },
        assigneeId: { type: 'number', nullable: true, example: 2 },
        topic: { type: 'string', enum: ['billing', 'bug', 'feature', 'other'], example: 'bug' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
        status: { type: 'string', enum: ['created', 'in_progress', 'completed'], example: 'in_progress' },
        description: { type: 'string', example: 'User is experiencing a login issue' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid status transition or validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  async updateTicket(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return await this.ticketService.updateTicket(id, updateTicketDto);
  }

  @Post('tickets/:id/finalizar')
  @ApiSecurity('x-account-sid')
  @ApiSecurity('x-api-key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Finalize ticket',
    description: 'Sets a ticket status to "completed". Ticket must be in "in_progress" status to be finalized. Requires x-account-sid and x-api-key headers.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Ticket ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket finalized successfully',
    schema: {
      type: 'object',
      properties: {
        ticketId: { type: 'number', example: 1 },
        requesterId: { type: 'number', example: 1 },
        assigneeId: { type: 'number', nullable: true, example: 2 },
        topic: { type: 'string', enum: ['billing', 'bug', 'feature', 'other'], example: 'bug' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
        status: { type: 'string', enum: ['created', 'in_progress', 'completed'], example: 'completed' },
        description: { type: 'string', example: 'User is experiencing a login issue' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - ticket cannot be finalized (must be in_progress)',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  async finalizeTicket(@Param('id', ParseIntPipe) id: number) {
    return await this.ticketService.finalizeTicket(id);
  }
}


