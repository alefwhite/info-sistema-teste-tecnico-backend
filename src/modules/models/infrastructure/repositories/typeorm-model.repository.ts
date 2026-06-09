import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { IModelRepository } from '../../domain/repositories/model.repository.interface';
import { Model } from '../../domain/entities/model.entity';
import { ModelOrmEntity } from '../database/model.orm-entity';
import { ModelHasVehiclesError } from '../../domain/errors/model-has-vehicles.error';

@Injectable()
export class TypeOrmModelRepository implements IModelRepository {
  constructor(
    @InjectRepository(ModelOrmEntity)
    private readonly repository: Repository<ModelOrmEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  private toDomain(orm: ModelOrmEntity): Model {
    return new Model(
      orm.id,
      orm.name,
      orm.brandId,
      orm.createdBy,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  async create(model: Model): Promise<Model> {
    const orm = this.repository.create({
      id: model.id,
      name: model.name,
      brandId: model.brandId,
      createdBy: model.createdBy,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
    await this.repository.save(orm);
    return model;
  }

  async findById(id: string): Promise<Model | null> {
    const orm = await this.repository.findOneBy({ id });
    return orm ? this.toDomain(orm) : null;
  }

  async findByNameAndBrandId(name: string, brandId: string): Promise<Model | null> {
    const orm = await this.repository.findOneBy({ name, brandId });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(): Promise<Model[]> {
    const orms = await this.repository.find();
    return orms.map((orm) => this.toDomain(orm));
  }

  async findByBrandId(brandId: string): Promise<Model[]> {
    const orms = await this.repository.findBy({ brandId });
    return orms.map((orm) => this.toDomain(orm));
  }

  async update(id: string, model: Partial<Model>): Promise<Model> {
    await this.repository.update(id, {
      ...(model.name !== undefined && { name: model.name }),
      ...(model.brandId !== undefined && { brandId: model.brandId }),
      updatedAt: model.updatedAt ?? new Date(),
    });
    const updated = await this.findById(id);
    if (!updated) throw new Error('Model not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    // Check if vehicles exist using this model_id via query
    const vehicleCount = await this.entityManager
      .createQueryBuilder()
      .select('v.id')
      .from('vehicles', 'v')
      .where('v.model_id = :modelId', { modelId: id })
      .getCount();

    if (vehicleCount > 0) {
      throw new ModelHasVehiclesError(id);
    }

    await this.repository.delete(id);
  }
}
