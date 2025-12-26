import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

/**
 * Script to check database connection and configuration
 * 
 * Run with: railway run npm run check:db
 */
async function bootstrap() {
  try {
    console.log('🔍 Checking database configuration...\n');

    // Check environment variables
    const nodeEnv = process.env.NODE_ENV || 'development';
    const databaseUrl = process.env.DATABASE_URL;
    
    console.log(`NODE_ENV: ${nodeEnv}`);
    console.log(`DATABASE_URL: ${databaseUrl ? '✅ Set' : '❌ Not set'}`);
    
    if (databaseUrl) {
      // Show first part of URL (without password)
      try {
        const url = new URL(databaseUrl.replace(/^postgres:/, 'postgresql:'));
        console.log(`Database Host: ${url.hostname}`);
        console.log(`Database Port: ${url.port || '5432'}`);
        console.log(`Database Name: ${url.pathname.slice(1)}`);
        console.log(`Database User: ${url.username}`);
      } catch (error) {
        console.log(`⚠️  DATABASE_URL format issue: ${error.message}`);
        console.log(`DATABASE_URL (first 50 chars): ${databaseUrl.substring(0, 50)}...`);
      }
    } else {
      console.log('\n⚠️  DATABASE_URL not set. Will use SQLite for local development.');
      console.log('   For Railway production, ensure PostgreSQL service is linked.');
    }

    console.log('\n🔌 Attempting database connection...\n');

    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    // Try to connect
    if (dataSource.isInitialized) {
      console.log('✅ Database connection successful!');
      
      // Try a simple query
      try {
        await dataSource.query('SELECT 1');
        console.log('✅ Database query test successful!');
      } catch (error) {
        console.error('❌ Database query failed:', error.message);
      }
    } else {
      console.log('⚠️  DataSource not initialized');
    }

    await app.close();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Verify PostgreSQL service is running in Railway');
    console.error('   2. Check that DATABASE_URL is set in Railway variables');
    console.error('   3. Ensure PostgreSQL service is linked to your app service');
    console.error('   4. Check Railway logs for database service status');
    process.exit(1);
  }
}

bootstrap();

