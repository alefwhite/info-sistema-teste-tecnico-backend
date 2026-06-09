import { Injectable } from '@nestjs/common';
import { IModelRepository } from '../../domain/repositories/model.repository.interface';
import { Model } from '../../domain/entities/model.entity';
import { FleetStoreService, ModelRecord } from '../../../../shared/infrastructure/fleet-store.service';
import { ModelHasVehiclesError } from '../../domain/errors/model-has-vehicles.error';

@Injectable()
export class InMemoryModelRepository implements IModelRepository {
  constructor(private readonly store: FleetStoreService) {}

  private toDomain(record: ModelRecord): Model {
    return new Model(
      record.id,
      record.name,
      record.brandId,
      record.createdBy,
      record.createdAt,
      record.updatedAt,
    );
  }

  private toRecord(domain: Model): ModelRecord {
    return {
      id: domain.id,
      name: domain.name,
      brandId: domain.brandId,
      createdBy: domain.createdBy,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }

  async create(model: Model): Promise<Model> {
    this.store.models.push(this.toRecord(model));
    return model;
  }

  async findById(id: string): Promise<Model | null> {
    const record = this.store.findModelById(id);
    return record ? this.toDomain(record) : null;
  }

  async findByNameAndBrandId(name: string, brandId: string): Promise<Model | null> {
    const record = this.store.findModelByNameAndBrandId(name, brandId);
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<Model[]> {
    return this.store.models.map((record) => this.toDomain(record));
  }

  async findByBrandId(brandId: string): Promise<Model[]> {
    return this.store.findModelsByBrandId(brandId).map((record) => this.toDomain(record));
  }

  async update(id: string, data: Partial<Model>): Promise<Model> {
    const record = this.store.findModelById(id);
    if (!record) {
      throw new Error('Model not found');
    }
    if (data.name !== undefined) record.name = data.name;
    if (data.brandId !== undefined) record.brandId = data.brandId;
    record.updatedAt = data.updatedAt ?? new Date();
    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    const index = this.store.models.findIndex((model) => model.id === id);
    if (index >= 0) {
      if (this.store.findVehiclesByModelId(id).length > 0) {
        throw new ModelHasVehiclesError(id);
      }
      this.store.models.splice(index, 1);
    }
  }
}
