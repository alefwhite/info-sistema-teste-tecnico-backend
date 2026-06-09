import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from '../database/user.orm-entity';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  private toDomain(orm: UserOrmEntity): User {
    return new User(
      orm.id,
      orm.nickname,
      orm.name,
      orm.email,
      orm.password,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  async create(user: User): Promise<User> {
    const orm = this.repository.create({
      id: user.id,
      nickname: user.nickname,
      name: user.name,
      email: user.email,
      password: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    await this.repository.save(orm);
    return user;
  }

  async findByLogin(login: string): Promise<User | null> {
    const orm = await this.repository.findOne({
      where: [
        { nickname: login },
        { email: login },
      ],
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findById(id: string): Promise<User | null> {
    const orm = await this.repository.findOneBy({ id });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(): Promise<User[]> {
    const orms = await this.repository.find();
    return orms.map((orm) => this.toDomain(orm));
  }
}
