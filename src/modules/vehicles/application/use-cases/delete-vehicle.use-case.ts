import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import type { ICacheProvider } from '../../../../shared/infrastructure/cache/cache-provider.interface';
import { VehicleNotFoundError } from '../../domain/errors/vehicle-not-found.error';

@Injectable()
export class DeleteVehicleUseCase {
  private readonly logger = new Logger(DeleteVehicleUseCase.name);

  constructor(
    @Inject('IVehicleRepository')
    private readonly repository: IVehicleRepository,
    @Inject('ICacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute(input: { id: string; userId: string }): Promise<void> {
    const vehicle = await this.repository.findById(input.id);
    if (!vehicle) {
      throw new VehicleNotFoundError(input.id);
    }
    await this.repository.delete(input.id);
    try {
      await this.cacheProvider.deletePrefix('vehicles:');
    } catch (err) {
      this.logger.error('Failed to invalidate cache', err);
    }
    this.logger.log({
      action: 'vehicle.deleted',
      entity: 'vehicle',
      entityId: input.id,
      userId: input.userId,
      timestamp: new Date().toISOString(),
    });
  }
}
