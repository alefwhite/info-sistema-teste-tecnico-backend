import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Brand } from '../../domain/entities/brand.entity';
import type { IBrandRepository } from '../../domain/repositories/brand.repository.interface';
import { BrandAlreadyExistsError } from '../../domain/errors/brand-already-exists.error';
import { CreateBrandDto } from '../dto/create-brand.dto';

@Injectable()
export class CreateBrandUseCase {
  private readonly logger = new Logger(CreateBrandUseCase.name);

  constructor(
    @Inject('IBrandRepository')
    private readonly repository: IBrandRepository,
  ) {}

  async execute(input: CreateBrandDto & { userId: string }): Promise<Brand> {
    const nameTrimmed = input.name.trim();
    const existing = await this.repository.findByName(nameTrimmed);
    if (existing) {
      throw new BrandAlreadyExistsError(nameTrimmed);
    }
    const now = new Date();
    const brand = new Brand(
      randomUUID(),
      nameTrimmed,
      input.userId,
      now,
      now,
    );
    await this.repository.create(brand);
    this.logger.log({
      action: 'brand.created',
      entity: 'brand',
      entityId: brand.id,
      userId: input.userId,
      timestamp: now.toISOString(),
    });
    return brand;
  }
}
