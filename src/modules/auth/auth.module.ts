import {
  Body,
  Controller,
  Module,
  HttpCode,
  HttpStatus,
  Injectable,
  Post,
  Inject,
} from '@nestjs/common';
import { JwtModule, JwtService, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as bcrypt from 'bcryptjs';
import { IsNotEmpty, IsString } from 'class-validator';
import { Logger } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { SharedInfrastructureModule } from '../../shared/infrastructure/shared-infrastructure.module';
import { JwtUserPayload } from '../../shared/auth/jwt-types';
import { UsersModule } from '../users/users.module';
import type { IUserRepository } from '../users/domain/repositories/user.repository.interface';
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  login!: string;
  @IsString()
  @IsNotEmpty()
  password!: string;
}
export interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    nickname: string;
    name: string;
    email: string;
  };
}
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
      throw new Error('Invalid credentials');
    }
    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid credentials');
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
export class JwtStrategyImpl extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'development-secret',
    });
  }
  async validate(payload: JwtUserPayload) {
    return payload;
  }
}
@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return {
      data: await this.loginUseCase.execute(dto),
    };
  }
}
@Module({
  imports: [
    SharedInfrastructureModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (): JwtModuleOptions => ({
        secret: process.env.JWT_SECRET ?? 'development-secret',
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES_IN as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [LoginUseCase, JwtStrategyImpl],
  exports: [JwtModule],
})
export class AuthModule {}
