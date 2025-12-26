import {
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTopicDto {
  @ApiPropertyOptional({
    description: 'Name of the topic',
    example: 'Technical Support',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Topic name cannot be empty' })
  @MaxLength(100, { message: 'Topic name cannot exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Whether the topic is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

