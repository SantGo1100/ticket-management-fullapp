import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Topics')
@Controller()
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get('topics')
  @ApiSecurity('x-account-sid')
  @ApiSecurity('x-api-key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all active topics',
    description: 'Retrieves a list of all active topics. Requires x-account-sid and x-api-key headers.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active topics retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Bug Report' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getActiveTopics() {
    return await this.topicService.findActiveTopics();
  }

  @Post('topics')
  @ApiSecurity('x-account-sid')
  @ApiSecurity('x-api-key')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new topic',
    description: 'Creates a new topic. The topic will be active by default. Requires x-account-sid and x-api-key headers.',
  })
  @ApiBody({ type: CreateTopicDto })
  @ApiResponse({
    status: 201,
    description: 'Topic created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Technical Support' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or topic name already exists',
  })
  async createTopic(@Body() createTopicDto: CreateTopicDto) {
    return await this.topicService.createTopic(createTopicDto.name);
  }

  @Patch('topics/:id')
  @ApiSecurity('x-account-sid')
  @ApiSecurity('x-api-key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a topic',
    description: 'Updates a topic\'s name and/or active status. Requires x-account-sid and x-api-key headers.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Topic ID',
    example: 1,
  })
  @ApiBody({ type: UpdateTopicDto })
  @ApiResponse({
    status: 200,
    description: 'Topic updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Technical Support' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or topic name already exists',
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found',
  })
  async updateTopic(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTopicDto: UpdateTopicDto,
  ) {
    return await this.topicService.updateTopic(
      id,
      updateTopicDto.name,
      updateTopicDto.isActive,
    );
  }

  @Delete('topics/:id')
  @ApiSecurity('x-account-sid')
  @ApiSecurity('x-api-key')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a topic',
    description: 'Physically deletes a topic. Tickets referencing this topic will have their topicId set to NULL, but topicNameSnapshot will preserve the topic name. Requires x-account-sid and x-api-key headers.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Topic ID',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Topic deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found',
  })
  async deleteTopic(@Param('id', ParseIntPipe) id: number) {
    await this.topicService.deleteTopic(id);
  }
}

