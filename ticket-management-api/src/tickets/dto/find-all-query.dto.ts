import { IsOptional, IsEnum, IsNumber, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus } from '../../entities/enums/ticket.enums';

export class FindAllQueryDto {
  @ApiPropertyOptional({
    description: 'Filter tickets by status',
    enum: TicketStatus,
    example: TicketStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({
    description: 'Filter tickets by requester ID',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  requester_id?: number;

  @ApiPropertyOptional({
    description: 'Filter tickets by requester name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  requester_name?: string;

  @ApiPropertyOptional({
    description: 'Filter tickets by assignee ID',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  assignee_id?: number;
}


