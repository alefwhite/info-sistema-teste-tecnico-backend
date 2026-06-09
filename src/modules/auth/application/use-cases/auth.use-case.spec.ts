import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { FleetStoreService } from '../../../../shared/infrastructure/fleet-store.service';
import { InMemoryUserRepository } from '../../../users/infrastructure/repositories/in-memory-user.repository';
import { LoginUseCase } from './login.use-case';
import { UnauthorizedUserError } from '../../domain/errors/unauthorized-user.error';
import { User } from '../../../users/domain/entities/user.entity';

describe('Auth Use Cases', () => {
  let store: FleetStoreService;
  let userRepository: InMemoryUserRepository;
  let jwtService: JwtService;
  let loginUseCase: LoginUseCase;
  let user: User;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'defaultUserPassword') return 'aivacol';
      return null;
    }),
  } as any;

  beforeEach(async () => {
    store = new FleetStoreService(mockConfigService);
    userRepository = new InMemoryUserRepository(store);
    jwtService = new JwtService({ secret: 'test-secret' });
    loginUseCase = new LoginUseCase(userRepository, jwtService);

    const hash = await bcrypt.hash('password123', 10);
    user = new User(
      'user-1',
      'aivacol',
      'Administrador',
      'admin@aivacol.com',
      hash,
      new Date(),
      new Date(),
    );
    await userRepository.create(user);
  });

  describe('LoginUseCase', () => {
    it('should login successfully with correct credentials', async () => {
      const result = await loginUseCase.execute({
        login: 'aivacol',
        password: 'password123',
      });
      expect(result.accessToken).toBeDefined();
      expect(result.user.nickname).toBe('aivacol');
      expect(result.user.email).toBe('admin@aivacol.com');
    });

    it('should throw UnauthorizedUserError if login is incorrect', async () => {
      await expect(
        loginUseCase.execute({
          login: 'wrong-user',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedUserError);
    });

    it('should throw UnauthorizedUserError if password is incorrect', async () => {
      await expect(
        loginUseCase.execute({
          login: 'aivacol',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedUserError);
    });
  });
});
