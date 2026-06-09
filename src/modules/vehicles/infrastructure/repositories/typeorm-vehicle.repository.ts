import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IVehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { VehicleOrmEntity } from '../database/vehicle.orm-entity';

@Injectable()
export class TypeOrmVehicleRepository implements IVehicleRepository {
  constructor(
    @InjectRepository(VehicleOrmEntity)
    private readonly repository: Repository<VehicleOrmEntity>,
  ) {}

  private toDomain(orm: VehicleOrmEntity): Vehicle {
    return new Vehicle(
      orm.id,
      orm.licensePlate,
      orm.chassis,
      orm.renavam,
      orm.year,
      orm.modelId,
      orm.createdBy,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  async create(vehicle: Vehicle): Promise<Vehicle> {
    const orm = this.repository.create({
      id: vehicle.id,
      licensePlate: vehicle.licensePlate,
      chassis: vehicle.chassis,
      renavam: vehicle.renavam,
      year: vehicle.year,
      modelId: vehicle.modelId,
      createdBy: vehicle.createdBy,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    });
    await this.repository.save(orm);
    return vehicle;
  }

  async findById(id: string): Promise<Vehicle | null> {
    const orm = await this.repository.findOneBy({ id });
    return orm ? this.toDomain(orm) : null;
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const orm = await this.repository.findOneBy({ licensePlate });
    return orm ? this.toDomain(orm) : null;
  }

  async findByChassis(chassis: string): Promise<Vehicle | null> {
    const orm = await this.repository.findOneBy({ chassis });
    return orm ? this.toDomain(orm) : null;
  }

  async findByRenavam(renavam: string): Promise<Vehicle | null> {
    const orm = await this.repository.findOneBy({ renavam });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(): Promise<Vehicle[]> {
    const orms = await this.repository.find();
    return orms.map((orm) => this.toDomain(orm));
  }

  async update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    await this.repository.update(id, {
      ...(vehicle.licensePlate !== undefined && {
        licensePlate: vehicle.licensePlate,
      }),
      ...(vehicle.chassis !== undefined && { chassis: vehicle.chassis }),
      ...(vehicle.renavam !== undefined && { renavam: vehicle.renavam }),
      ...(vehicle.year !== undefined && { year: vehicle.year }),
      ...(vehicle.modelId !== undefined && { modelId: vehicle.modelId }),
      updatedAt: vehicle.updatedAt ?? new Date(),
    });
    const updated = await this.findById(id);
    if (!updated) throw new Error('Vehicle not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
