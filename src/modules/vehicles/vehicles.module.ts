import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedInfrastructureModule } from '../../shared/infrastructure/shared-infrastructure.module';
import { ModelsModule } from '../models/models.module';
import { VehicleController } from './presentation/controllers/vehicle.controller';
import { CreateVehicleUseCase } from './application/use-cases/create-vehicle.use-case';
import { UpdateVehicleUseCase } from './application/use-cases/update-vehicle.use-case';
import { DeleteVehicleUseCase } from './application/use-cases/delete-vehicle.use-case';
import { FindVehicleUseCase } from './application/use-cases/find-vehicle.use-case';
import { ListVehiclesUseCase } from './application/use-cases/list-vehicles.use-case';
import { InMemoryVehicleRepository } from './infrastructure/repositories/in-memory-vehicle.repository';
import { TypeOrmVehicleRepository } from './infrastructure/repositories/typeorm-vehicle.repository';
import { VehicleOrmEntity } from './infrastructure/database/vehicle.orm-entity';

const databaseProvider = process.env.DATABASE_PROVIDER ?? 'inmemory';

const repositoryProvider = {
  provide: 'IVehicleRepository',
  useClass:
    databaseProvider === 'typeorm'
      ? TypeOrmVehicleRepository
      : InMemoryVehicleRepository,
};

@Module({
  imports: [
    SharedInfrastructureModule,
    ModelsModule,
    ...(databaseProvider === 'typeorm'
      ? [TypeOrmModule.forFeature([VehicleOrmEntity])]
      : []),
  ],
  controllers: [VehicleController],
  providers: [
    repositoryProvider,
    CreateVehicleUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
    FindVehicleUseCase,
    ListVehiclesUseCase,
  ],
  exports: ['IVehicleRepository'],
})
export class VehiclesModule {}
