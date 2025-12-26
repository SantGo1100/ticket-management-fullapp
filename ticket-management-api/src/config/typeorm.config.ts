import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    
    // Use PostgreSQL if DATABASE_URL is provided (Railway production)
    // Otherwise use SQLite (local development or scripts)
    if (databaseUrl && databaseUrl.startsWith('postgres')) {
      // Railway PostgreSQL configuration
      try {
        // Validate URL format - handle both postgres:// and postgresql://
        const urlString = databaseUrl.replace(/^postgres:/, 'postgresql:');
        const url = new URL(urlString);
        
        // Extract connection details for better error messages
        const host = url.hostname;
        const port = url.port || '5432';
        const database = url.pathname.slice(1); // Remove leading '/'
        
        console.log(`[TypeORM] Connecting to PostgreSQL at ${host}:${port}/${database}`);
        
        return {
          type: 'postgres',
          url: databaseUrl, // Use URL directly for better compatibility with Railway
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE', false), // Disabled by default in production
          ssl: this.configService.get<boolean>('DB_SSL', true) ? { rejectUnauthorized: false } : false, // Enable SSL for Railway
          logging: this.configService.get<string>('DB_LOGGING', 'false') === 'true',
          extra: {
            // Connection pool settings for Railway
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
          },
        };
      } catch (error) {
        console.error('[TypeORM] Invalid DATABASE_URL format:', error.message);
        console.error('[TypeORM] DATABASE_URL value (first 50 chars):', databaseUrl?.substring(0, 50));
        throw new Error(`Invalid DATABASE_URL format: ${error.message}. Please check your Railway database connection.`);
      }
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



