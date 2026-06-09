import { Injectable } from '@nestjs/common';
import { ICacheProvider } from './cache/cache-provider.interface';

type CacheEntry<T> = {
  value: T;
  expiresAt: number | null;
};

@Injectable()
export class InMemoryCacheProvider implements ICacheProvider {
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null,
    });
  }
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
  async deletePrefix(prefix: string): Promise<void> {
    for (const key of [...this.cache.keys()]) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}
