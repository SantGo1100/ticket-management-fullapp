import {
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTopicDto {
  @ApiProperty({
    description: 'Name of the topic',
    example: 'Technical Support',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1, { message: 'Topic name cannot be empty' })
  @MaxLength(100, { message: 'Topic name cannot exceed 100 characters' })
  name: string;
}

