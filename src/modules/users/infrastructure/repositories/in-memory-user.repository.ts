import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import {
  FleetStoreService,
  UserRecord,
} from '../../../../shared/infrastructure/fleet-store.service';

@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  constructor(private readonly store: FleetStoreService) {}

  private toDomain(record: UserRecord): User {
    return new User(
      record.id,
      record.nickname,
      record.name,
      record.email,
      record.password,
      record.createdAt,
      record.updatedAt,
    );
  }

  private toRecord(domain: User): UserRecord {
    return {
      id: domain.id,
      nickname: domain.nickname,
      name: domain.name,
      email: domain.email,
      password: domain.passwordHash,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }

  async create(user: User): Promise<User> {
    this.store.users.push(this.toRecord(user));
    return user;
  }

  async findByLogin(login: string): Promise<User | null> {
    const record = this.store.findUserByLogin(login);
    return record ? this.toDomain(record) : null;
  }

  async findById(id: string): Promise<User | null> {
    const record = this.store.findUserById(id);
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<User[]> {
    return this.store.users.map((record) => this.toDomain(record));
  }
}
