import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Account } from '../entities/account.entity';
import { ApiKey } from '../entities/api-key.entity';

/**
 * Script to check if an account exists in the database
 * 
 * Run with: railway run npm run check:account
 * Or: ts-node -r tsconfig-paths/register src/scripts/check-account.ts
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('🔍 Checking accounts in database...\n');

    const accountRepository = dataSource.getRepository(Account);
    const apiKeyRepository = dataSource.getRepository(ApiKey);

    const accounts = await accountRepository.find({
      relations: ['apiKeys'],
    });

    if (accounts.length === 0) {
      console.log('❌ No accounts found in database!');
      console.log('\n💡 Solution: Run the seed script:');
      console.log('   railway run npm run seed:account');
      process.exit(1);
    }

    console.log(`✅ Found ${accounts.length} account(s):\n`);

    for (const account of accounts) {
      console.log(`Account ID: ${account.id}`);
      console.log(`  SID: ${account.sid}`);
      console.log(`  Name: ${account.name}`);
      console.log(`  Created: ${account.createdAt}`);
      
      const activeKeys = account.apiKeys.filter(k => k.isActive);
      console.log(`  Active API Keys: ${activeKeys.length}`);
      
      if (activeKeys.length === 0) {
        console.log('  ⚠️  WARNING: No active API keys for this account!');
      }
      
      console.log('');
    }

    // Check for the default test account
    const testAccount = accounts.find(a => a.sid === 'AC123456789');
    if (!testAccount) {
      console.log('⚠️  Default test account (AC123456789) not found.');
      console.log('   If you\'re using default credentials, run:');
      console.log('   railway run npm run seed:account');
    } else {
      console.log('✅ Default test account found!');
    }

  } catch (error) {
    console.error('❌ Error checking accounts:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();

