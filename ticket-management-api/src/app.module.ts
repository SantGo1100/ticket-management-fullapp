import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmConfigService } from './config/typeorm.config';
import { TicketModule } from './tickets/ticket.module';
import { TopicModule } from './topics/topic.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Global configuration module - loads .env file
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // TypeORM module with async configuration
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    // Auth module (global guard is registered here)
    AuthModule,
    // Topic module
    TopicModule,
    // Ticket module
    TicketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


