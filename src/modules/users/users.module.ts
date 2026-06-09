import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedInfrastructureModule } from '../../shared/infrastructure/shared-infrastructure.module';
import { InMemoryUserRepository } from './infrastructure/repositories/in-memory-user.repository';
import { TypeOrmUserRepository } from './infrastructure/repositories/typeorm-user.repository';
import { UserOrmEntity } from './infrastructure/database/user.orm-entity';
import { DatabaseSeedService } from './infrastructure/database/database-seed.service';
import configuration from '../../config/configuration';

const config = configuration();
const databaseProvider = config.databaseProvider;

const repositoryProvider = {
  provide: 'IUserRepository',
  useClass:
    databaseProvider === 'typeorm'
      ? TypeOrmUserRepository
      : InMemoryUserRepository,
};

@Module({
  imports: [
    SharedInfrastructureModule,
    ...(databaseProvider === 'typeorm'
      ? [TypeOrmModule.forFeature([UserOrmEntity])]
      : []),
  ],
  providers: [repositoryProvider, DatabaseSeedService],
  exports: ['IUserRepository'],
})
export class UsersModule {}
