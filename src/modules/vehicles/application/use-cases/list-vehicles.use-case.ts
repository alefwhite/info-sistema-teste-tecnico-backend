import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    private readonly configService: ConfigService,
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
      const ttl = this.configService.get<number>('cacheTtl') ?? 3600;
      await this.cacheProvider.set(cacheKey, vehicles, ttl);
    } catch (err) {
      this.logger.error('Failed to save to cache', err);
    }

    return vehicles;
  }
}
