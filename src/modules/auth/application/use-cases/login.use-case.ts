import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { JwtUserPayload } from '../../../../shared/auth/jwt-types';
import { LoginDto, LoginResult } from '../dto/login.dto';
import { UnauthorizedUserError } from '../../domain/errors/unauthorized-user.error';

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject('IUserRepository')
    private readonly usersRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginDto): Promise<LoginResult> {
    const user = await this.usersRepository.findByLogin(input.login);
    if (!user) {
      throw new UnauthorizedUserError();
    }
    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedUserError();
    }
    const payload: JwtUserPayload = {
      sub: user.id,
      login: user.nickname,
      name: user.name,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    this.logger.log({
      action: 'auth.login',
      entity: 'auth',
      entityId: user.id,
      userId: user.id,
      timestamp: new Date().toISOString(),
    });
    return {
      accessToken,
      user: {
        id: user.id,
        nickname: user.nickname,
        name: user.name,
        email: user.email,
      },
    };
  }
}
