import { Model } from '../entities/model.entity';

export interface IModelRepository {
  create(model: Model): Promise<Model>;
  findById(id: string): Promise<Model | null>;
  findByNameAndBrandId(name: string, brandId: string): Promise<Model | null>;
  findAll(): Promise<Model[]>;
  findByBrandId(brandId: string): Promise<Model[]>;
  update(id: string, model: Partial<Model>): Promise<Model>;
  delete(id: string): Promise<void>;
}
