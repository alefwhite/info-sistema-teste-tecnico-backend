import { Inject, Injectable } from '@nestjs/common';
import type { IModelRepository } from '../../domain/repositories/model.repository.interface';
import { ModelNotFoundError } from '../../domain/errors/model-not-found.error';
import { Model } from '../../domain/entities/model.entity';

@Injectable()
export class FindModelUseCase {
  constructor(
    @Inject('IModelRepository')
    private readonly repository: IModelRepository,
  ) {}

  async execute(id: string): Promise<Model> {
    const model = await this.repository.findById(id);
    if (!model) {
      throw new ModelNotFoundError(id);
    }
    return model;
  }
}
