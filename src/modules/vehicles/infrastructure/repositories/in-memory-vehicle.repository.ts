import { Injectable } from '@nestjs/common';
import { IVehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import {
  FleetStoreService,
  VehicleRecord,
} from '../../../../shared/infrastructure/fleet-store.service';

@Injectable()
export class InMemoryVehicleRepository implements IVehicleRepository {
  constructor(private readonly store: FleetStoreService) {}

  private toDomain(record: VehicleRecord): Vehicle {
    return new Vehicle(
      record.id,
      record.licensePlate,
      record.chassis,
      record.renavam,
      record.year,
      record.modelId,
      record.createdBy,
      record.createdAt,
      record.updatedAt,
    );
  }

  private toRecord(domain: Vehicle): VehicleRecord {
    return {
      id: domain.id,
      licensePlate: domain.licensePlate,
      chassis: domain.chassis,
      renavam: domain.renavam,
      year: domain.year,
      modelId: domain.modelId,
      createdBy: domain.createdBy,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }

  async create(vehicle: Vehicle): Promise<Vehicle> {
    this.store.vehicles.push(this.toRecord(vehicle));
    return vehicle;
  }

  async findById(id: string): Promise<Vehicle | null> {
    const record = this.store.findVehicleById(id);
    return record ? this.toDomain(record) : null;
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const record = this.store.findVehicleByLicensePlate(licensePlate);
    return record ? this.toDomain(record) : null;
  }

  async findByChassis(chassis: string): Promise<Vehicle | null> {
    const record = this.store.findVehicleByChassis(chassis);
    return record ? this.toDomain(record) : null;
  }

  async findByRenavam(renavam: string): Promise<Vehicle | null> {
    const record = this.store.findVehicleByRenavam(renavam);
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<Vehicle[]> {
    return this.store.vehicles.map((record) => this.toDomain(record));
  }

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const record = this.store.findVehicleById(id);
    if (!record) {
      throw new Error('Vehicle not found');
    }
    if (data.licensePlate !== undefined)
      record.licensePlate = data.licensePlate;
    if (data.chassis !== undefined) record.chassis = data.chassis;
    if (data.renavam !== undefined) record.renavam = data.renavam;
    if (data.year !== undefined) record.year = data.year;
    if (data.modelId !== undefined) record.modelId = data.modelId;
    record.updatedAt = data.updatedAt ?? new Date();
    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    const index = this.store.vehicles.findIndex((v) => v.id === id);
    if (index >= 0) {
      this.store.vehicles.splice(index, 1);
    }
  }
}
