import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IBrandRepository } from '../../domain/repositories/brand.repository.interface';
import { BrandNotFoundError } from '../../domain/errors/brand-not-found.error';

@Injectable()
export class DeleteBrandUseCase {
  private readonly logger = new Logger(DeleteBrandUseCase.name);

  constructor(
    @Inject('IBrandRepository')
    private readonly repository: IBrandRepository,
  ) {}

  async execute(input: { id: string; userId: string }): Promise<void> {
    const brand = await this.repository.findById(input.id);
    if (!brand) {
      throw new BrandNotFoundError(input.id);
    }
    await this.repository.delete(input.id);
    this.logger.log({
      action: 'brand.deleted',
      entity: 'brand',
      entityId: input.id,
      userId: input.userId,
      timestamp: new Date().toISOString(),
    });
  }
}
