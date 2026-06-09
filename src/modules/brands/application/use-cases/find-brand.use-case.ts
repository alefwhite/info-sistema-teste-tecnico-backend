import { Inject, Injectable } from '@nestjs/common';
import type { IBrandRepository } from '../../domain/repositories/brand.repository.interface';
import { BrandNotFoundError } from '../../domain/errors/brand-not-found.error';
import { Brand } from '../../domain/entities/brand.entity';

@Injectable()
export class FindBrandUseCase {
  constructor(
    @Inject('IBrandRepository')
    private readonly repository: IBrandRepository,
  ) {}

  async execute(id: string): Promise<Brand> {
    const brand = await this.repository.findById(id);
    if (!brand) {
      throw new BrandNotFoundError(id);
    }
    return brand;
  }
}
