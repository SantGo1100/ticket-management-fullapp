import {
  IsNumber,
  IsEnum,
  IsString,
  IsOptional,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketTopic, TicketPriority } from '../../entities/enums/ticket.enums';

export class CreateTicketDto {
  @ApiProperty({
    description: 'ID of the user requesting the ticket',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  requester_id: number;

  @ApiProperty({
    description: 'Name of the user requesting the ticket',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(1, { message: 'Requester name cannot be empty' })
  requester_name: string;

  @ApiPropertyOptional({
    description: 'ID of the user assigned to the ticket',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  assignee_id?: number;

  @ApiProperty({
    description: 'Topic category of the ticket',
    enum: TicketTopic,
    example: TicketTopic.BUG,
  })
  @IsEnum(TicketTopic)
  topic: TicketTopic;

  @ApiProperty({
    description: 'Priority level of the ticket',
    enum: TicketPriority,
    example: TicketPriority.HIGH,
  })
  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @ApiProperty({
    description: 'Detailed description of the ticket',
    example: 'User is experiencing a login issue after updating their password',
  })
  @IsString()
  description: string;
}


