import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  nickname: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface BrandRecord {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface ModelRecord {
  id: string;
  name: string;
  brandId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface VehicleRecord {
  id: string;
  licensePlate: string;
  chassis: string;
  renavam: string;
  year: number;
  modelId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
const normalize = (value: string) => value.trim().toLowerCase();
@Injectable()
export class FleetStoreService implements OnModuleInit {
  readonly users: UserRecord[] = [];
  readonly brands: BrandRecord[] = [];
  readonly models: ModelRecord[] = [];
  readonly vehicles: VehicleRecord[] = [];

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    if (this.users.some((user) => normalize(user.nickname) === 'aivacol')) {
      return;
    }
    const password = this.configService.get<string>('defaultUserPassword') ?? 'aivacol';
    const hashedPassword = await bcrypt.hash(password, 10);
    this.users.push({
      id: randomUUID(),
      nickname: 'aivacol',
      name: 'Administrador',
      email: 'admin@aivacol.com',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  findUserByLogin(login: string): UserRecord | undefined {
    const value = normalize(login);
    return this.users.find(
      (user) =>
        normalize(user.nickname) === value || normalize(user.email) === value,
    );
  }
  findUserById(id: string): UserRecord | undefined {
    return this.users.find((user) => user.id === id);
  }
  findBrandById(id: string): BrandRecord | undefined {
    return this.brands.find((brand) => brand.id === id);
  }
  findBrandByName(name: string): BrandRecord | undefined {
    const value = normalize(name);
    return this.brands.find((brand) => normalize(brand.name) === value);
  }
  findModelsByBrandId(brandId: string): ModelRecord[] {
    return this.models.filter((model) => model.brandId === brandId);
  }
  findModelById(id: string): ModelRecord | undefined {
    return this.models.find((model) => model.id === id);
  }
  findModelByNameAndBrandId(
    name: string,
    brandId: string,
  ): ModelRecord | undefined {
    const value = normalize(name);
    return this.models.find(
      (model) => model.brandId === brandId && normalize(model.name) === value,
    );
  }
  findVehiclesByModelId(modelId: string): VehicleRecord[] {
    return this.vehicles.filter((vehicle) => vehicle.modelId === modelId);
  }
  findVehicleById(id: string): VehicleRecord | undefined {
    return this.vehicles.find((vehicle) => vehicle.id === id);
  }
  findVehicleByLicensePlate(licensePlate: string): VehicleRecord | undefined {
    const value = normalize(licensePlate);
    return this.vehicles.find(
      (vehicle) => normalize(vehicle.licensePlate) === value,
    );
  }
  findVehicleByChassis(chassis: string): VehicleRecord | undefined {
    const value = normalize(chassis);
    return this.vehicles.find(
      (vehicle) => normalize(vehicle.chassis) === value,
    );
  }
  findVehicleByRenavam(renavam: string): VehicleRecord | undefined {
    const value = normalize(renavam);
    return this.vehicles.find(
      (vehicle) => normalize(vehicle.renavam) === value,
    );
  }
}
