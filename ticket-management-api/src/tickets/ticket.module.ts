import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { Ticket } from '../entities/ticket.entity';
import { TopicModule } from '../topics/topic.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    TopicModule,
  ],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}


