import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ICacheProvider } from './cache-provider.interface';

@Injectable()
export class RedisCacheProvider
  implements ICacheProvider, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisCacheProvider.name);
  private client!: Redis;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('redis.host') ?? 'localhost';
    const port = this.configService.get<number>('redis.port') ?? 6379;

    this.client = new Redis({
      host,
      port,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis client error', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      this.isConnected = true;
    });

    try {
      await this.client.connect();
      this.isConnected = true;
      this.logger.log('Redis connected successfully');
    } catch (err) {
      this.logger.error('Redis connection failed, cache will be bypassed', err);
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      this.logger.error(`Failed to get key ${key} from Redis`, err);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      const str = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await this.client.set(key, str, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, str);
      }
    } catch (err) {
      this.logger.error(`Failed to set key ${key} in Redis`, err);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (err) {
      this.logger.error(`Failed to delete key ${key} from Redis`, err);
    }
  }

  async deletePrefix(prefix: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      const keys = await this.client.keys(`${prefix}*`);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (err) {
      this.logger.error(`Failed to delete prefix ${prefix} from Redis`, err);
    }
  }
}
