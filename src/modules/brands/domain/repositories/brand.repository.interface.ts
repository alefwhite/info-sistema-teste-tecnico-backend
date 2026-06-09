import { Brand } from '../entities/brand.entity';

export interface IBrandRepository {
  create(brand: Brand): Promise<Brand>;
  findById(id: string): Promise<Brand | null>;
  findByName(name: string): Promise<Brand | null>;
  findAll(): Promise<Brand[]>;
  update(id: string, brand: Partial<Brand>): Promise<Brand>;
  delete(id: string): Promise<void>;
}
