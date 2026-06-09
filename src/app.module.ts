import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ModelsModule } from './modules/models/models.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { SharedInfrastructureModule } from './shared/infrastructure/shared-infrastructure.module';
import { InitialSchema1717888888888 } from './shared/infrastructure/database/migrations/1717888888888-InitialSchema';
import { MongoModule } from './shared/infrastructure/mongodb/mongo.module';
import { AuditMiddleware } from './shared/middleware/audit.middleware';
import configuration from './config/configuration';

const config = configuration();
const databaseProvider = config.databaseProvider;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    SharedInfrastructureModule,
    MongoModule,
    ...(databaseProvider === 'typeorm'
      ? [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              type: 'mssql',
              host: configService.get<string>('db.host'),
              port: configService.get<number>('db.port'),
              username: configService.get<string>('db.username'),
              password: configService.get<string>('db.password'),
              database: configService.get<string>('db.database'),
              autoLoadEntities: true,
              synchronize: false,
              migrations: [InitialSchema1717888888888],
              migrationsRun: true,
              options: {
                encrypt: true,
                trustServerCertificate: true,
              },
            }),
          }),
        ]
      : []),
    UsersModule,
    AuthModule,
    BrandsModule,
    ModelsModule,
    VehiclesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuditMiddleware).forRoutes('*');
  }
}
