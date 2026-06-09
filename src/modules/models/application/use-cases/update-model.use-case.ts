import { Inject, Injectable, Logger } from '@nestjs/common';
import { Model } from '../../domain/entities/model.entity';
import type { IModelRepository } from '../../domain/repositories/model.repository.interface';
import type { IBrandRepository } from '../../../brands/domain/repositories/brand.repository.interface';
import { BrandNotFoundError } from '../../../brands/domain/errors/brand-not-found.error';
import { ModelNotFoundError } from '../../domain/errors/model-not-found.error';
import { ModelAlreadyExistsError } from '../../domain/errors/model-already-exists.error';
import { UpdateModelDto } from '../dto/update-model.dto';

@Injectable()
export class UpdateModelUseCase {
  private readonly logger = new Logger(UpdateModelUseCase.name);

  constructor(
    @Inject('IModelRepository')
    private readonly repository: IModelRepository,
    @Inject('IBrandRepository')
    private readonly brandRepository: IBrandRepository,
  ) {}

  async execute(input: { id: string; userId: string } & UpdateModelDto): Promise<Model> {
    const model = await this.repository.findById(input.id);
    if (!model) {
      throw new ModelNotFoundError(input.id);
    }
    const updateData: Partial<Model> = {};
    if (input.brandId !== undefined) {
      const brand = await this.brandRepository.findById(input.brandId);
      if (!brand) {
        throw new BrandNotFoundError(input.brandId);
      }
      model.brandId = input.brandId;
      updateData.brandId = input.brandId;
    }
    if (input.name !== undefined) {
      const nameTrimmed = input.name.trim();
      const conflict = await this.repository.findByNameAndBrandId(nameTrimmed, model.brandId);
      if (conflict && conflict.id !== input.id) {
        throw new ModelAlreadyExistsError(nameTrimmed, model.brandId);
      }
      model.name = nameTrimmed;
      updateData.name = nameTrimmed;
    }
    model.updatedAt = new Date();
    updateData.updatedAt = model.updatedAt;
    await this.repository.update(input.id, updateData);
    this.logger.log({
      action: 'model.updated',
      entity: 'model',
      entityId: model.id,
      userId: input.userId,
      timestamp: model.updatedAt.toISOString(),
    });
    return model;
  }
}
