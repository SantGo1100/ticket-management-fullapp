import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Account } from '../entities/account.entity';
import { ApiKey } from '../entities/api-key.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  async validateAccountAndApiKey(sid: string, apiKey: string): Promise<Account> {
    // Find account by SID
    const account = await this.accountRepository.findOne({
      where: { sid },
    });

    if (!account) {
      throw new UnauthorizedException('Invalid account SID');
    }

    // Find all active API keys for this account
    const apiKeys = await this.apiKeyRepository.find({
      where: { accountId: account.id, isActive: true },
    });

    if (apiKeys.length === 0) {
      throw new UnauthorizedException('No active API key found for this account');
    }

    // Check if provided API key matches any of the stored hashes
    const isValid = await Promise.all(
      apiKeys.map((storedKey) => bcrypt.compare(apiKey, storedKey.keyHash)),
    );

    if (!isValid.some((valid) => valid)) {
      throw new UnauthorizedException('Invalid API key');
    }

    return account;
  }

  /**
   * Utility method to create an account with an API key (for seeding/testing)
   * Returns the plain API key (only shown once during creation)
   */
  async createAccountWithApiKey(
    sid: string,
    name: string,
    plainApiKey: string,
  ): Promise<{ account: Account; apiKey: string }> {
    // Check if account already exists
    let account = await this.accountRepository.findOne({
      where: { sid },
    });

    if (!account) {
      account = this.accountRepository.create({ sid, name });
      account = await this.accountRepository.save(account);
    }

    // Hash the API key
    const saltRounds = 10;
    const keyHash = await bcrypt.hash(plainApiKey, saltRounds);

    // Create API key record
    const apiKey = this.apiKeyRepository.create({
      accountId: account.id,
      keyHash,
      isActive: true,
    });

    await this.apiKeyRepository.save(apiKey);

    // Return account and plain API key (only shown once)
    return { account, apiKey: plainApiKey };
  }
}

