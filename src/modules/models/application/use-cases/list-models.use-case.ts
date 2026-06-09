import { Inject, Injectable } from '@nestjs/common';
import type { IModelRepository } from '../../domain/repositories/model.repository.interface';
import { Model } from '../../domain/entities/model.entity';

@Injectable()
export class ListModelsUseCase {
  constructor(
    @Inject('IModelRepository')
    private readonly repository: IModelRepository,
  ) {}

  async execute(): Promise<Model[]> {
    return this.repository.findAll();
  }
}
