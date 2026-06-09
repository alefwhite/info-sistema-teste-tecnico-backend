import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const existing = await this.userRepository.findByLogin('aivacol');
    if (existing) {
      return;
    }
    const password = this.configService.get<string>('defaultUserPassword') ?? 'aivacol';
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User(
      randomUUID(),
      'aivacol',
      'Administrador',
      'admin@aivacol.com',
      passwordHash,
      new Date(),
      new Date(),
    );
    await this.userRepository.create(user);
    this.logger.log('Default seed user "aivacol" created successfully');
  }
}
