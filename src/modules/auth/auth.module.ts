import { Module } from '@nestjs/common';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SharedInfrastructureModule } from '../../shared/infrastructure/shared-infrastructure.module';
import { UsersModule } from '../users/users.module';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { JwtStrategyImpl } from './infrastructure/jwt/jwt.strategy';
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [
    SharedInfrastructureModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (): JwtModuleOptions => ({
        secret: process.env.JWT_SECRET ?? 'development-secret',
        signOptions: {
          expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [LoginUseCase, JwtStrategyImpl],
  exports: [JwtModule],
})
export class AuthModule {}
