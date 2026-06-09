import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IBrandRepository } from '../../domain/repositories/brand.repository.interface';
import { BrandNotFoundError } from '../../domain/errors/brand-not-found.error';
import { BrandAlreadyExistsError } from '../../domain/errors/brand-already-exists.error';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { Brand } from '../../domain/entities/brand.entity';

@Injectable()
export class UpdateBrandUseCase {
  private readonly logger = new Logger(UpdateBrandUseCase.name);

  constructor(
    @Inject('IBrandRepository')
    private readonly repository: IBrandRepository,
  ) {}

  async execute(
    input: { id: string; userId: string } & UpdateBrandDto,
  ): Promise<Brand> {
    const brand = await this.repository.findById(input.id);
    if (!brand) {
      throw new BrandNotFoundError(input.id);
    }
    const updateData: Partial<Brand> = {};
    if (input.name !== undefined) {
      const nameTrimmed = input.name.trim();
      const conflict = await this.repository.findByName(nameTrimmed);
      if (conflict && conflict.id !== input.id) {
        throw new BrandAlreadyExistsError(nameTrimmed);
      }
      brand.name = nameTrimmed;
      updateData.name = nameTrimmed;
    }
    brand.updatedAt = new Date();
    updateData.updatedAt = brand.updatedAt;
    await this.repository.update(input.id, updateData);
    this.logger.log({
      action: 'brand.updated',
      entity: 'brand',
      entityId: brand.id,
      userId: input.userId,
      timestamp: brand.updatedAt.toISOString(),
    });
    return brand;
  }
}
