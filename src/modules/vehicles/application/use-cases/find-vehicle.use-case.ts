import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import type { ICacheProvider } from '../../../../shared/infrastructure/cache/cache-provider.interface';
import { VehicleNotFoundError } from '../../domain/errors/vehicle-not-found.error';
import { Vehicle } from '../../domain/entities/vehicle.entity';

@Injectable()
export class FindVehicleUseCase {
  private readonly logger = new Logger(FindVehicleUseCase.name);

  constructor(
    @Inject('IVehicleRepository')
    private readonly repository: IVehicleRepository,
    @Inject('ICacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute(id: string): Promise<Vehicle> {
    const cacheKey = `vehicles:${id}`;
    try {
      const cached = await this.cacheProvider.get<Vehicle>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (err) {
      this.logger.error('Failed to get from cache', err);
    }

    const vehicle = await this.repository.findById(id);
    if (!vehicle) {
      throw new VehicleNotFoundError(id);
    }

    try {
      const ttl = Number(process.env.CACHE_TTL ?? 3600);
      await this.cacheProvider.set(cacheKey, vehicle, ttl);
    } catch (err) {
      this.logger.error('Failed to save to cache', err);
    }

    return vehicle;
  }
}
