import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import type { ICacheProvider } from '../../../../shared/infrastructure/cache/cache-provider.interface';
import { Vehicle } from '../../domain/entities/vehicle.entity';

@Injectable()
export class ListVehiclesUseCase {
  private readonly logger = new Logger(ListVehiclesUseCase.name);

  constructor(
    @Inject('IVehicleRepository')
    private readonly repository: IVehicleRepository,
    @Inject('ICacheProvider')
    private readonly cacheProvider: ICacheProvider,
  ) {}

  async execute(): Promise<Vehicle[]> {
    const cacheKey = 'vehicles:list';
    try {
      const cached = await this.cacheProvider.get<Vehicle[]>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (err) {
      this.logger.error('Failed to get from cache', err);
    }

    const vehicles = await this.repository.findAll();

    try {
      const ttl = Number(process.env.CACHE_TTL ?? 3600);
      await this.cacheProvider.set(cacheKey, vehicles, ttl);
    } catch (err) {
      this.logger.error('Failed to save to cache', err);
    }

    return vehicles;
  }
}
