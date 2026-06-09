import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedInfrastructureModule } from '../../shared/infrastructure/shared-infrastructure.module';
import { BrandsModule } from '../brands/brands.module';
import { ModelController } from './presentation/controllers/model.controller';
import { CreateModelUseCase } from './application/use-cases/create-model.use-case';
import { UpdateModelUseCase } from './application/use-cases/update-model.use-case';
import { DeleteModelUseCase } from './application/use-cases/delete-model.use-case';
import { FindModelUseCase } from './application/use-cases/find-model.use-case';
import { ListModelsUseCase } from './application/use-cases/list-models.use-case';
import { InMemoryModelRepository } from './infrastructure/repositories/in-memory-model.repository';
import { TypeOrmModelRepository } from './infrastructure/repositories/typeorm-model.repository';
import { ModelOrmEntity } from './infrastructure/database/model.orm-entity';
import configuration from '../../config/configuration';

const config = configuration();
const databaseProvider = config.databaseProvider;

const repositoryProvider = {
  provide: 'IModelRepository',
  useClass:
    databaseProvider === 'typeorm'
      ? TypeOrmModelRepository
      : InMemoryModelRepository,
};

@Module({
  imports: [
    SharedInfrastructureModule,
    BrandsModule,
    ...(databaseProvider === 'typeorm'
      ? [TypeOrmModule.forFeature([ModelOrmEntity])]
      : []),
  ],
  controllers: [ModelController],
  providers: [
    repositoryProvider,
    CreateModelUseCase,
    UpdateModelUseCase,
    DeleteModelUseCase,
    FindModelUseCase,
    ListModelsUseCase,
  ],
  exports: ['IModelRepository'],
})
export class ModelsModule {}
