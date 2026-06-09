import { Module } from '@nestjs/common';
import { FleetStoreService } from './fleet-store.service';
import { InMemoryCacheProvider } from './in-memory-cache.provider';
@Module({
  providers: [FleetStoreService, InMemoryCacheProvider],
  exports: [FleetStoreService, InMemoryCacheProvider],
})
export class SharedInfrastructureModule {}
