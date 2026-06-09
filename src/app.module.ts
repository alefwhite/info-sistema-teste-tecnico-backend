import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ModelsModule } from './modules/models/models.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { SharedInfrastructureModule } from './shared/infrastructure/shared-infrastructure.module';
import { InitialSchema1717888888888 } from './shared/infrastructure/database/migrations/1717888888888-InitialSchema';

const databaseProvider = process.env.DATABASE_PROVIDER ?? 'inmemory';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    SharedInfrastructureModule,
    ...(databaseProvider === 'typeorm'
      ? [
          TypeOrmModule.forRoot({
            type: 'mssql',
            host: process.env.DB_HOST ?? 'localhost',
            port: Number(process.env.DB_PORT ?? 1433),
            username: process.env.DB_USER ?? 'sa',
            password: process.env.DB_PASSWORD ?? 'YourStrong@Pass123',
            database: process.env.DB_NAME ?? 'fleet_db',
            autoLoadEntities: true,
            synchronize: false,
            migrations: [InitialSchema1717888888888],
            migrationsRun: true,
            options: {
              encrypt: true,
              trustServerCertificate: true,
            },
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
export class AppModule {}
