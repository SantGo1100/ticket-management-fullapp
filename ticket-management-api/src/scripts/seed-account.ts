import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  // Create test account
  // NOTE: These are example values for development/testing only
  // In production, use secure, randomly generated values
  const sid = process.env.SEED_ACCOUNT_SID || 'AC123456789';
  const name = process.env.SEED_ACCOUNT_NAME || 'Test Account';
  const apiKey = process.env.SEED_API_KEY || 'sk_live_abc123xyz456';

  try {
    const result = await authService.createAccountWithApiKey(sid, name, apiKey);
    console.log('✅ Account created successfully!');
    console.log('Account SID:', result.account.sid);
    console.log('Account Name:', result.account.name);
    console.log('API Key:', result.apiKey);
    console.log('\nYou can now use these credentials in your requests:');
    console.log(`x-account-sid: ${result.account.sid}`);
    console.log(`x-api-key: ${result.apiKey}`);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      console.log('ℹ️  Account already exists. Adding new API key...');
      const result = await authService.createAccountWithApiKey(sid, name, apiKey);
      console.log('✅ New API key created!');
      console.log('API Key:', result.apiKey);
    } else {
      console.error('❌ Error:', error.message);
    }
  }

  await app.close();
}

bootstrap();

