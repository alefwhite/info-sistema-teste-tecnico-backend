import { Inject, Injectable, Logger } from '@nestjs/common';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import type { IModelRepository } from '../../../models/domain/repositories/model.repository.interface';
import type { ICacheProvider } from '../../../../shared/infrastructure/cache/cache-provider.interface';
import { ModelNotFoundError } from '../../../models/domain/errors/model-not-found.error';
import { VehicleNotFoundError } from '../../domain/errors/vehicle-not-found.error';
import { VehicleAlreadyExistsError } from '../../domain/errors/vehicle-already-exists.error';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

@Injectable()
export class UpdateVehicleUseCase {
  private readonly logger = new Logger(UpdateVehicleUseCase.name);

  constructor(
    @Inject('IVehicleRepository')
    private readonly repository: IVehicleRepository,
    @Inject('IModelRepository')
    private readonly modelRepository: IModelRepository,
    @Inject('ICacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute(
    input: { id: string; userId: string } & UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.repository.findById(input.id);
    if (!vehicle) {
      throw new VehicleNotFoundError(input.id);
    }
    const updateData: Partial<Vehicle> = {};
    if (input.modelId !== undefined) {
      const model = await this.modelRepository.findById(input.modelId);
      if (!model) {
        throw new ModelNotFoundError(input.modelId);
      }
      vehicle.modelId = input.modelId;
      updateData.modelId = input.modelId;
    }
    if (input.licensePlate !== undefined) {
      const plate = input.licensePlate.trim();
      const conflict = await this.repository.findByLicensePlate(plate);
      if (conflict && conflict.id !== input.id) {
        throw new VehicleAlreadyExistsError('licensePlate', plate);
      }
      vehicle.licensePlate = plate;
      updateData.licensePlate = plate;
    }
    if (input.chassis !== undefined) {
      const chassis = input.chassis.trim();
      const conflict = await this.repository.findByChassis(chassis);
      if (conflict && conflict.id !== input.id) {
        throw new VehicleAlreadyExistsError('chassis', chassis);
      }
      vehicle.chassis = chassis;
      updateData.chassis = chassis;
    }
    if (input.renavam !== undefined) {
      const renavam = input.renavam.trim();
      const conflict = await this.repository.findByRenavam(renavam);
      if (conflict && conflict.id !== input.id) {
        throw new VehicleAlreadyExistsError('renavam', renavam);
      }
      vehicle.renavam = renavam;
      updateData.renavam = renavam;
    }
    if (input.year !== undefined) {
      vehicle.year = input.year;
      updateData.year = input.year;
    }
    vehicle.updatedAt = new Date();
    updateData.updatedAt = vehicle.updatedAt;
    await this.repository.update(input.id, updateData);
    try {
      await this.cacheProvider.deletePrefix('vehicles:');
    } catch (err) {
      this.logger.error('Failed to invalidate cache', err);
    }
    this.logger.log({
      action: 'vehicle.updated',
      entity: 'vehicle',
      entityId: vehicle.id,
      userId: input.userId,
      timestamp: vehicle.updatedAt.toISOString(),
    });
    return vehicle;
  }
}
