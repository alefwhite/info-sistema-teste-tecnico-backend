import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IModelRepository } from '../../domain/repositories/model.repository.interface';
import { ModelNotFoundError } from '../../domain/errors/model-not-found.error';

@Injectable()
export class DeleteModelUseCase {
  private readonly logger = new Logger(DeleteModelUseCase.name);

  constructor(
    @Inject('IModelRepository')
    private readonly repository: IModelRepository,
  ) {}

  async execute(input: { id: string; userId: string }): Promise<void> {
    const model = await this.repository.findById(input.id);
    if (!model) {
      throw new ModelNotFoundError(input.id);
    }
    await this.repository.delete(input.id);
    this.logger.log({
      action: 'model.deleted',
      entity: 'model',
      entityId: input.id,
      userId: input.userId,
      timestamp: new Date().toISOString(),
    });
  }
}
