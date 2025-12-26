import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Account } from '../entities/account.entity';
import { ApiKey } from '../entities/api-key.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Account, ApiKey])],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}

