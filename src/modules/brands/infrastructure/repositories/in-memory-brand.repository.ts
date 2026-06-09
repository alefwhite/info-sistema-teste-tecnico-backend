import { Injectable } from '@nestjs/common';
import { IBrandRepository } from '../../domain/repositories/brand.repository.interface';
import { Brand } from '../../domain/entities/brand.entity';
import {
  FleetStoreService,
  BrandRecord,
} from '../../../../shared/infrastructure/fleet-store.service';
import { BrandHasModelsError } from '../../domain/errors/brand-has-models.error';

@Injectable()
export class InMemoryBrandRepository implements IBrandRepository {
  constructor(private readonly store: FleetStoreService) {}

  private toDomain(record: BrandRecord): Brand {
    return new Brand(
      record.id,
      record.name,
      record.createdBy,
      record.createdAt,
      record.updatedAt,
    );
  }

  private toRecord(domain: Brand): BrandRecord {
    return {
      id: domain.id,
      name: domain.name,
      createdBy: domain.createdBy,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }

  async create(brand: Brand): Promise<Brand> {
    this.store.brands.push(this.toRecord(brand));
    return brand;
  }

  async findById(id: string): Promise<Brand | null> {
    const record = this.store.findBrandById(id);
    return record ? this.toDomain(record) : null;
  }

  async findByName(name: string): Promise<Brand | null> {
    const record = this.store.findBrandByName(name);
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<Brand[]> {
    return this.store.brands.map((record) => this.toDomain(record));
  }

  async update(id: string, data: Partial<Brand>): Promise<Brand> {
    const record = this.store.findBrandById(id);
    if (!record) {
      throw new Error('Brand not found');
    }
    if (data.name !== undefined) record.name = data.name;
    record.updatedAt = data.updatedAt ?? new Date();
    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    const index = this.store.brands.findIndex((brand) => brand.id === id);
    if (index >= 0) {
      if (this.store.findModelsByBrandId(id).length > 0) {
        throw new BrandHasModelsError(id);
      }
      this.store.brands.splice(index, 1);
    }
  }
}
