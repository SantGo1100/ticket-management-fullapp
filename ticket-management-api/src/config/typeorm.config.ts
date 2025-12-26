import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const isProduction = nodeEnv === 'production';

    // Use PostgreSQL in production (Railway), SQLite in development
    if (isProduction) {
      // Railway PostgreSQL configuration
      const databaseUrl = this.configService.get<string>('DATABASE_URL');
      if (!databaseUrl) {
        throw new Error('DATABASE_URL is required in production');
      }

      // Parse DATABASE_URL (format: postgresql://user:password@host:port/database)
      // Handle both postgresql:// and postgres:// protocols
      const urlString = databaseUrl.replace(/^postgres:/, 'postgresql:');
      const url = new URL(urlString);
      
      return {
        type: 'postgres',
        url: databaseUrl, // Use URL directly for better compatibility
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE', false), // Disabled by default in production
        ssl: this.configService.get<boolean>('DB_SSL', true) ? { rejectUnauthorized: false } : false, // Enable SSL for Railway
        logging: this.configService.get<string>('DB_LOGGING', 'false') === 'true',
      };
    } else {
      // SQLite for local development
      return {
        type: 'sqlite',
        database: this.configService.get<string>('DB_DATABASE', 'database.sqlite'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE', true),
        logging: true,
      };
    }
  }
}



