import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from '../entities/topic.entity';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
  ) {}

  /**
   * Find all active topics
   */
  async findActiveTopics(): Promise<Topic[]> {
    return await this.topicRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Find a topic by ID
   */
  async findById(id: number): Promise<Topic | null> {
    return await this.topicRepository.findOne({
      where: { id },
    });
  }

  /**
   * Find a topic by ID and validate it's active
   */
  async findActiveById(id: number): Promise<Topic | null> {
    return await this.topicRepository.findOne({
      where: { id, isActive: true },
    });
  }

  /**
   * Create a new topic
   */
  async createTopic(name: string): Promise<Topic> {
    // Check if topic with same name already exists
    const existingTopic = await this.topicRepository.findOne({
      where: { name },
    });

    if (existingTopic) {
      throw new BadRequestException(`Topic with name "${name}" already exists`);
    }

    const topic = this.topicRepository.create({
      name,
      isActive: true,
    });

    return await this.topicRepository.save(topic);
  }

  /**
   * Update a topic by ID
   */
  async updateTopic(id: number, name?: string, isActive?: boolean): Promise<Topic> {
    const topic = await this.findById(id);
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    // If name is being updated, check if another topic with that name exists
    if (name !== undefined && name !== topic.name) {
      const existingTopic = await this.topicRepository.findOne({
        where: { name },
      });

      if (existingTopic) {
        throw new BadRequestException(`Topic with name "${name}" already exists`);
      }

      topic.name = name;
    }

    // Update isActive if provided
    if (isActive !== undefined) {
      topic.isActive = isActive;
    }

    return await this.topicRepository.save(topic);
  }

  /**
   * Delete a topic by ID
   * Note: This will set topicId to NULL in all referencing tickets (onDelete: 'SET NULL')
   * The topicNameSnapshot in tickets will preserve the topic name
   */
  async deleteTopic(id: number): Promise<void> {
    const topic = await this.findById(id);
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    // Physical deletion - TypeORM will handle SET NULL on tickets automatically
    // All tickets referencing this topic will have their topicId set to NULL
    // but topicNameSnapshot will preserve the original topic name
    await this.topicRepository.remove(topic);
  }
}

