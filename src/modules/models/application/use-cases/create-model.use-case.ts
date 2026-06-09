import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Model } from '../../domain/entities/model.entity';
import type { IModelRepository } from '../../domain/repositories/model.repository.interface';
import type { IBrandRepository } from '../../../brands/domain/repositories/brand.repository.interface';
import { BrandNotFoundError } from '../../../brands/domain/errors/brand-not-found.error';
import { ModelAlreadyExistsError } from '../../domain/errors/model-already-exists.error';
import { CreateModelDto } from '../dto/create-model.dto';

@Injectable()
export class CreateModelUseCase {
  private readonly logger = new Logger(CreateModelUseCase.name);

  constructor(
    @Inject('IModelRepository')
    private readonly repository: IModelRepository,
    @Inject('IBrandRepository')
    private readonly brandRepository: IBrandRepository,
  ) {}

  async execute(input: CreateModelDto & { userId: string }): Promise<Model> {
    const brand = await this.brandRepository.findById(input.brandId);
    if (!brand) {
      throw new BrandNotFoundError(input.brandId);
    }
    const nameTrimmed = input.name.trim();
    const existing = await this.repository.findByNameAndBrandId(nameTrimmed, input.brandId);
    if (existing) {
      throw new ModelAlreadyExistsError(nameTrimmed, input.brandId);
    }
    const now = new Date();
    const model = new Model(
      randomUUID(),
      nameTrimmed,
      input.brandId,
      input.userId,
      now,
      now,
    );
    await this.repository.create(model);
    this.logger.log({
      action: 'model.created',
      entity: 'model',
      entityId: model.id,
      userId: input.userId,
      timestamp: now.toISOString(),
    });
    return model;
  }
}
