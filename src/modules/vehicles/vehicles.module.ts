import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  Module,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { SharedInfrastructureModule } from '../../shared/infrastructure/shared-infrastructure.module';
import {
  FleetStoreService,
  VehicleRecord,
} from '../../shared/infrastructure/fleet-store.service';
import { InMemoryCacheProvider } from '../../shared/infrastructure/in-memory-cache.provider';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../shared/auth/jwt-types';
const currentYear = new Date().getFullYear() + 1;
export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  licensePlate!: string;
  @IsString()
  @IsNotEmpty()
  chassis!: string;
  @IsString()
  @IsNotEmpty()
  renavam!: string;
  @IsInt()
  @Min(1900)
  @Max(currentYear)
  year!: number;
  @IsUUID()
  modelId!: string;
}
export class UpdateVehicleDto {
  @IsString()
  @IsOptional()
  licensePlate?: string;
  @IsString()
  @IsOptional()
  chassis?: string;
  @IsString()
  @IsOptional()
  renavam?: string;
  @IsInt()
  @Min(1900)
  @Max(currentYear)
  @IsOptional()
  year?: number;
  @IsUUID()
  @IsOptional()
  modelId?: string;
}
@Injectable()
export class InMemoryVehiclesRepository {
  constructor(private readonly store: FleetStoreService) {}
  async create(record: VehicleRecord): Promise<VehicleRecord> {
    this.store.vehicles.push(record);
    return record;
  }
  async findById(id: string): Promise<VehicleRecord | undefined> {
    return this.store.findVehicleById(id);
  }
  async findAll(): Promise<VehicleRecord[]> {
    return [...this.store.vehicles];
  }
  async update(id: string, data: Partial<VehicleRecord>): Promise<VehicleRecord> {
    const vehicle = this.store.findVehicleById(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    Object.assign(vehicle, data, { updatedAt: new Date() });
    return vehicle;
  }
  async delete(id: string): Promise<void> {
    const index = this.store.vehicles.findIndex((vehicle) => vehicle.id === id);
    if (index >= 0) {
      this.store.vehicles.splice(index, 1);
    }
  }
}
@Injectable()
export class CreateVehicleUseCase {
  private readonly logger = new Logger(CreateVehicleUseCase.name);
  constructor(
    private readonly repository: InMemoryVehiclesRepository,
    private readonly store: FleetStoreService,
    private readonly cache: InMemoryCacheProvider,
  ) {}
  async execute(input: CreateVehicleDto & { userId: string }) {
    if (!this.store.findModelById(input.modelId)) {
      throw new Error('Model not found');
    }
    if (this.store.findVehicleByLicensePlate(input.licensePlate)) {
      throw new Error('License plate already exists');
    }
    if (this.store.findVehicleByChassis(input.chassis)) {
      throw new Error('Chassis already exists');
    }
    if (this.store.findVehicleByRenavam(input.renavam)) {
      throw new Error('Renavam already exists');
    }
    const now = new Date();
    const vehicle: VehicleRecord = {
      id: randomUUID(),
      licensePlate: input.licensePlate.trim(),
      chassis: input.chassis.trim(),
      renavam: input.renavam.trim(),
      year: input.year,
      modelId: input.modelId,
      createdBy: input.userId,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.create(vehicle);
    await this.cache.deletePrefix('vehicles:');
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
@Injectable()
export class UpdateVehicleUseCase {
  private readonly logger = new Logger(UpdateVehicleUseCase.name);
  constructor(
    private readonly repository: InMemoryVehiclesRepository,
    private readonly store: FleetStoreService,
    private readonly cache: InMemoryCacheProvider,
  ) {}
  async execute(input: { id: string; userId: string } & UpdateVehicleDto) {
    const vehicle = await this.repository.findById(input.id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    const nextLicensePlate = input.licensePlate ?? vehicle.licensePlate;
    const nextChassis = input.chassis ?? vehicle.chassis;
    const nextRenavam = input.renavam ?? vehicle.renavam;
    const nextYear = input.year ?? vehicle.year;
    const nextModelId = input.modelId ?? vehicle.modelId;
    if (!this.store.findModelById(nextModelId)) {
      throw new Error('Model not found');
    }
    const plateConflict = this.store.findVehicleByLicensePlate(nextLicensePlate);
    if (plateConflict && plateConflict.id !== input.id) {
      throw new Error('License plate already exists');
    }
    const chassisConflict = this.store.findVehicleByChassis(nextChassis);
    if (chassisConflict && chassisConflict.id !== input.id) {
      throw new Error('Chassis already exists');
    }
    const renavamConflict = this.store.findVehicleByRenavam(nextRenavam);
    if (renavamConflict && renavamConflict.id !== input.id) {
      throw new Error('Renavam already exists');
    }
    Object.assign(vehicle, {
      licensePlate: nextLicensePlate.trim(),
      chassis: nextChassis.trim(),
      renavam: nextRenavam.trim(),
      year: nextYear,
      modelId: nextModelId,
      updatedAt: new Date(),
    });
    await this.cache.deletePrefix('vehicles:');
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
@Injectable()
export class DeleteVehicleUseCase {
  private readonly logger = new Logger(DeleteVehicleUseCase.name);
  constructor(
    private readonly repository: InMemoryVehiclesRepository,
    private readonly cache: InMemoryCacheProvider,
  ) {}
  async execute(input: { id: string; userId: string }) {
    const vehicle = await this.repository.findById(input.id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    await this.repository.delete(input.id);
    await this.cache.deletePrefix('vehicles:');
    this.logger.log({
      action: 'vehicle.deleted',
      entity: 'vehicle',
      entityId: input.id,
      userId: input.userId,
      timestamp: new Date().toISOString(),
    });
  }
}
@Injectable()
export class FindVehicleUseCase {
  constructor(
    private readonly repository: InMemoryVehiclesRepository,
    private readonly cache: InMemoryCacheProvider,
  ) {}
  async execute(id: string) {
    const cacheKey = `vehicles:${id}`;
    const cached = await this.cache.get<VehicleRecord>(cacheKey);
    if (cached) {
      return cached;
    }
    const vehicle = await this.repository.findById(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    await this.cache.set(cacheKey, vehicle, Number(process.env.CACHE_TTL ?? 3600));
    return vehicle;
  }
}
@Injectable()
export class ListVehiclesUseCase {
  constructor(
    private readonly repository: InMemoryVehiclesRepository,
    private readonly cache: InMemoryCacheProvider,
  ) {}
  async execute() {
    const cacheKey = 'vehicles:list';
    const cached = await this.cache.get<VehicleRecord[]>(cacheKey);
    if (cached) {
      return cached;
    }
    const vehicles = await this.repository.findAll();
    await this.cache.set(cacheKey, vehicles, Number(process.env.CACHE_TTL ?? 3600));
    return vehicles;
  }
}
@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
    private readonly findVehicleUseCase: FindVehicleUseCase,
    private readonly listVehiclesUseCase: ListVehiclesUseCase,
  ) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateVehicleDto, @Req() req: AuthenticatedRequest) {
    return { data: await this.createVehicleUseCase.execute({ ...dto, userId: req.user.sub }) };
  }
  @Get()
  async list() {
    return { data: await this.listVehiclesUseCase.execute() };
  }
  @Get(':id')
  async find(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.findVehicleUseCase.execute(id) };
  }
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return {
      data: await this.updateVehicleUseCase.execute({ id, ...dto, userId: req.user.sub }),
    };
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    await this.deleteVehicleUseCase.execute({ id, userId: req.user.sub });
  }
}
@Module({
  imports: [SharedInfrastructureModule],
  controllers: [VehiclesController],
  providers: [
    InMemoryVehiclesRepository,
    CreateVehicleUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
    FindVehicleUseCase,
    ListVehiclesUseCase,
  ],
  exports: [InMemoryVehiclesRepository],
})
export class VehiclesModule {}
