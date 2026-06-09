import { ConfigService } from '@nestjs/config';

export default () => {
  const configService = new ConfigService();

  return {
    port: Number(configService.get<string>('PORT') ?? 3000),
    nodeEnv: configService.get<string>('NODE_ENV') ?? 'development',
    databaseProvider: configService.get<string>('DATABASE_PROVIDER') ?? 'inmemory',
    db: {
      host: configService.get<string>('DB_HOST') ?? 'localhost',
      port: Number(configService.get<string>('DB_PORT') ?? 1433),
      username: configService.get<string>('DB_USER') ?? 'sa',
      password: configService.get<string>('DB_PASSWORD') ?? 'YourStrong@Pass123',
      database: configService.get<string>('DB_NAME') ?? 'fleet_db',
    },
    jwt: {
      secret: configService.get<string>('JWT_SECRET') ?? 'development-secret',
      expiresIn: configService.get<string>('JWT_EXPIRES_IN') ?? '7d',
    },
    redis: {
      host: configService.get<string>('REDIS_HOST') ?? 'localhost',
      port: Number(configService.get<string>('REDIS_PORT') ?? 6379),
    },
    cacheTtl: Number(configService.get<string>('CACHE_TTL') ?? 3600),
    rabbitmq: {
      url: configService.get<string>('RABBITMQ_URL') ?? 'amqp://guest:guest@localhost:5672',
    },
    mongo: {
      uri: configService.get<string>('MONGO_URI') ?? 'mongodb://localhost:27017/fleet_audit',
    },
    defaultUserPassword: configService.get<string>('DEFAULT_USER_PASSWORD') ?? 'aivacol',
  };
};
