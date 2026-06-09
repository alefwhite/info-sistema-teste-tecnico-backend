import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { IBrandRepository } from '../../domain/repositories/brand.repository.interface';
import { Brand } from '../../domain/entities/brand.entity';
import { BrandOrmEntity } from '../database/brand.orm-entity';
import { BrandHasModelsError } from '../../domain/errors/brand-has-models.error';

@Injectable()
export class TypeOrmBrandRepository implements IBrandRepository {
  constructor(
    @InjectRepository(BrandOrmEntity)
    private readonly repository: Repository<BrandOrmEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  private toDomain(orm: BrandOrmEntity): Brand {
    return new Brand(
      orm.id,
      orm.name,
      orm.createdBy,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  async create(brand: Brand): Promise<Brand> {
    const orm = this.repository.create({
      id: brand.id,
      name: brand.name,
      createdBy: brand.createdBy,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    });
    await this.repository.save(orm);
    return brand;
  }

  async findById(id: string): Promise<Brand | null> {
    const orm = await this.repository.findOneBy({ id });
    return orm ? this.toDomain(orm) : null;
  }

  async findByName(name: string): Promise<Brand | null> {
    const orm = await this.repository.findOneBy({ name });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(): Promise<Brand[]> {
    const orms = await this.repository.find();
    return orms.map((orm) => this.toDomain(orm));
  }

  async update(id: string, brand: Partial<Brand>): Promise<Brand> {
    await this.repository.update(id, {
      ...(brand.name !== undefined && { name: brand.name }),
      updatedAt: brand.updatedAt ?? new Date(),
    });
    const updated = await this.findById(id);
    if (!updated) throw new Error('Brand not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    // Check models using query to avoid circular imports
    const modelCount = await this.entityManager
      .createQueryBuilder()
      .select('m.id')
      .from('models', 'm')
      .where('m.brand_id = :brandId', { brandId: id })
      .getCount();

    if (modelCount > 0) {
      throw new BrandHasModelsError(id);
    }

    await this.repository.delete(id);
  }
}
