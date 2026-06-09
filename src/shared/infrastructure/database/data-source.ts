import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { UserOrmEntity } from '../../../modules/users/infrastructure/database/user.orm-entity';
import { BrandOrmEntity } from '../../../modules/brands/infrastructure/database/brand.orm-entity';
import { ModelOrmEntity } from '../../../modules/models/infrastructure/database/model.orm-entity';
import { VehicleOrmEntity } from '../../../modules/vehicles/infrastructure/database/vehicle.orm-entity';
import configuration from '../../../config/configuration';

dotenv.config();
const config = configuration();

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  entities: [UserOrmEntity, BrandOrmEntity, ModelOrmEntity, VehicleOrmEntity],
  migrations: ['src/shared/infrastructure/database/migrations/*.ts'],
  synchronize: false,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
});
