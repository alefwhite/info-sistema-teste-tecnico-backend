import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import type { IModelRepository } from '../../../models/domain/repositories/model.repository.interface';
import type { ICacheProvider } from '../../../../shared/infrastructure/cache/cache-provider.interface';
import { ModelNotFoundError } from '../../../models/domain/errors/model-not-found.error';
import { VehicleAlreadyExistsError } from '../../domain/errors/vehicle-already-exists.error';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';

@Injectable()
export class CreateVehicleUseCase {
  private readonly logger = new Logger(CreateVehicleUseCase.name);

  constructor(
    @Inject('IVehicleRepository')
    private readonly repository: IVehicleRepository,
    @Inject('IModelRepository')
    private readonly modelRepository: IModelRepository,
    @Inject('ICacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute(
    input: CreateVehicleDto & { userId: string },
  ): Promise<Vehicle> {
    const model = await this.modelRepository.findById(input.modelId);
    if (!model) {
      throw new ModelNotFoundError(input.modelId);
    }
    const plate = input.licensePlate.trim();
    const existingPlate = await this.repository.findByLicensePlate(plate);
    if (existingPlate) {
      throw new VehicleAlreadyExistsError('licensePlate', plate);
    }
    const chassis = input.chassis.trim();
    const existingChassis = await this.repository.findByChassis(chassis);
    if (existingChassis) {
      throw new VehicleAlreadyExistsError('chassis', chassis);
    }
    const renavam = input.renavam.trim();
    const existingRenavam = await this.repository.findByRenavam(renavam);
    if (existingRenavam) {
      throw new VehicleAlreadyExistsError('renavam', renavam);
    }
    const now = new Date();
    const vehicle = new Vehicle(
      randomUUID(),
      plate,
      chassis,
      renavam,
      input.year,
      input.modelId,
      input.userId,
      now,
      now,
    );
    await this.repository.create(vehicle);
    try {
      await this.cacheProvider.deletePrefix('vehicles:');
    } catch (err) {
      this.logger.error('Failed to invalidate cache', err);
    }
    this.logger.log({
      action: 'vehicle.created',
      entity: 'vehicle',
      entityId: vehicle.id,
      userId: input.userId,
      timestamp: now.toISOString(),
    });
    return vehicle;
  }
}
