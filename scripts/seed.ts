import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CreateBrandUseCase } from '../src/modules/brands/application/use-cases/create-brand.use-case';
import { CreateModelUseCase } from '../src/modules/models/application/use-cases/create-model.use-case';
import { CreateVehicleUseCase } from '../src/modules/vehicles/application/use-cases/create-vehicle.use-case';
import type { IUserRepository } from '../src/modules/users/domain/repositories/user.repository.interface';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const brandUseCase = app.get(CreateBrandUseCase);
  const modelUseCase = app.get(CreateModelUseCase);
  const vehicleUseCase = app.get(CreateVehicleUseCase);
  const userRepository = app.get<IUserRepository>('IUserRepository');

  const user = await userRepository.findByLogin('aivacol');
  if (!user) {
    console.error('Seed user "aivacol" not found. Make sure the database initialization ran first.');
    await app.close();
    process.exit(1);
  }
  const userId = user.id;

  const filePath = path.join(process.cwd(), 'seed_vehicles.json');
  if (!fs.existsSync(filePath)) {
    console.error(`File seed_vehicles.json not found at: ${filePath}`);
    await app.close();
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const brandCache = new Map<string, string>();
  const modelCache = new Map<string, string>();

  const getBrandId = async (name: string): Promise<string> => {
    if (brandCache.has(name)) return brandCache.get(name)!;
    try {
      const b = await brandUseCase.execute({ name, userId });
      brandCache.set(name, b.id);
      return b.id;
    } catch (err: any) {
      const brandRepo = app.get('IBrandRepository') as any;
      const b = await brandRepo.findByName(name);
      if (b) {
        brandCache.set(name, b.id);
        return b.id;
      }
      throw err;
    }
  };

  const getModelId = async (name: string, brandId: string): Promise<string> => {
    const key = `${name}:${brandId}`;
    if (modelCache.has(key)) return modelCache.get(key)!;
    try {
      const m = await modelUseCase.execute({ name, brandId, userId });
      modelCache.set(key, m.id);
      return m.id;
    } catch (err: any) {
      const modelRepo = app.get('IModelRepository') as any;
      const m = await modelRepo.findByNameAndBrandId(name, brandId);
      if (m) {
        modelCache.set(key, m.id);
        return m.id;
      }
      throw err;
    }
  };

  for (const item of data) {
    try {
      console.log(`Processing vehicle: ${item.licensePlate} (${item.brandName} ${item.modelName})`);
      const brandId = await getBrandId(item.brandName);
      const modelId = await getModelId(item.modelName, brandId);

      await vehicleUseCase.execute({
        licensePlate: item.licensePlate,
        chassis: item.chassis,
        renavam: item.renavam,
        year: item.year,
        modelId,
        userId,
      });
      console.log(`✓ Vehicle ${item.licensePlate} seeded successfully.`);
    } catch (err: any) {
      console.log(`⚠ Skip vehicle ${item.licensePlate}: ${err.message}`);
    }
  }

  await app.close();
  console.log('Seeding process finished.');
}

bootstrap();
