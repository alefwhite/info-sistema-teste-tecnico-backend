import { Inject, Injectable } from '@nestjs/common';
import type { IBrandRepository } from '../../domain/repositories/brand.repository.interface';
import { Brand } from '../../domain/entities/brand.entity';

@Injectable()
export class ListBrandsUseCase {
  constructor(
    @Inject('IBrandRepository')
    private readonly repository: IBrandRepository,
  ) {}

  async execute(): Promise<Brand[]> {
    return this.repository.findAll();
  }
}
