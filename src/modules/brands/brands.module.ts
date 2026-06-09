import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedInfrastructureModule } from '../../shared/infrastructure/shared-infrastructure.module';
import { BrandController } from './presentation/controllers/brand.controller';
import { CreateBrandUseCase } from './application/use-cases/create-brand.use-case';
import { UpdateBrandUseCase } from './application/use-cases/update-brand.use-case';
import { DeleteBrandUseCase } from './application/use-cases/delete-brand.use-case';
import { FindBrandUseCase } from './application/use-cases/find-brand.use-case';
import { ListBrandsUseCase } from './application/use-cases/list-brands.use-case';
import { InMemoryBrandRepository } from './infrastructure/repositories/in-memory-brand.repository';
import { TypeOrmBrandRepository } from './infrastructure/repositories/typeorm-brand.repository';
import { BrandOrmEntity } from './infrastructure/database/brand.orm-entity';

const databaseProvider = process.env.DATABASE_PROVIDER ?? 'inmemory';

const repositoryProvider = {
  provide: 'IBrandRepository',
  useClass:
    databaseProvider === 'typeorm'
      ? TypeOrmBrandRepository
      : InMemoryBrandRepository,
};

@Module({
  imports: [
    SharedInfrastructureModule,
    ...(databaseProvider === 'typeorm'
      ? [TypeOrmModule.forFeature([BrandOrmEntity])]
      : []),
  ],
  controllers: [BrandController],
  providers: [
    repositoryProvider,
    CreateBrandUseCase,
    UpdateBrandUseCase,
    DeleteBrandUseCase,
    FindBrandUseCase,
    ListBrandsUseCase,
  ],
  exports: ['IBrandRepository'],
})
export class BrandsModule {}
