import { Module } from '@nestjs/common';
import { FleetStoreService } from './fleet-store.service';
import { InMemoryCacheProvider } from './in-memory-cache.provider';
import { RedisCacheProvider } from './cache/redis-cache-provider';

const databaseProvider = process.env.DATABASE_PROVIDER ?? 'inmemory';

const cacheProvider = {
  provide: 'ICacheProvider',
  useClass:
    databaseProvider === 'typeorm' ? RedisCacheProvider : InMemoryCacheProvider,
};

@Module({
  providers: [
    FleetStoreService,
    InMemoryCacheProvider,
    RedisCacheProvider,
    cacheProvider,
  ],
  exports: [
    FleetStoreService,
    InMemoryCacheProvider,
    RedisCacheProvider,
    cacheProvider,
  ],
})
export class SharedInfrastructureModule {}
