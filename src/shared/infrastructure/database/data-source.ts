import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { UserOrmEntity } from '../../../modules/users/infrastructure/database/user.orm-entity';
import { BrandOrmEntity } from '../../../modules/brands/infrastructure/database/brand.orm-entity';
import { ModelOrmEntity } from '../../../modules/models/infrastructure/database/model.orm-entity';
import { VehicleOrmEntity } from '../../../modules/vehicles/infrastructure/database/vehicle.orm-entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 1433),
  username: process.env.DB_USER ?? 'sa',
  password: process.env.DB_PASSWORD ?? 'YourStrong@Pass123',
  database: process.env.DB_NAME ?? 'fleet_db',
  entities: [UserOrmEntity, BrandOrmEntity, ModelOrmEntity, VehicleOrmEntity],
  migrations: ['src/shared/infrastructure/database/migrations/*.ts'],
  synchronize: false,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
});
