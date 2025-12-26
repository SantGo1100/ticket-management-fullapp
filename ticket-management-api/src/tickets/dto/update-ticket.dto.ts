import { IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus } from '../../entities/enums/ticket.enums';

export class UpdateTicketDto {
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

  @ApiPropertyOptional({
    description: 'Current status of the ticket',
    enum: TicketStatus,
    example: TicketStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}


