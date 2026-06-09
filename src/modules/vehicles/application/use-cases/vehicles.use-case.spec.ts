import { FleetStoreService } from '../../../../shared/infrastructure/fleet-store.service';
import { InMemoryVehicleRepository } from '../../infrastructure/repositories/in-memory-vehicle.repository';
import { InMemoryModelRepository } from '../../../models/infrastructure/repositories/in-memory-model.repository';
import { InMemoryCacheProvider } from '../../../../shared/infrastructure/in-memory-cache.provider';
import { CreateVehicleUseCase } from './create-vehicle.use-case';
import { UpdateVehicleUseCase } from './update-vehicle.use-case';
import { DeleteVehicleUseCase } from './delete-vehicle.use-case';
import { FindVehicleUseCase } from './find-vehicle.use-case';
import { ListVehiclesUseCase } from './list-vehicles.use-case';
import { ModelNotFoundError } from '../../../models/domain/errors/model-not-found.error';
import { VehicleAlreadyExistsError } from '../../domain/errors/vehicle-already-exists.error';
import { VehicleNotFoundError } from '../../domain/errors/vehicle-not-found.error';
import { Model } from '../../../models/domain/entities/model.entity';

describe('Vehicles Use Cases', () => {
  let store: FleetStoreService;
  let repository: InMemoryVehicleRepository;
  let modelRepository: InMemoryModelRepository;
  let cacheProvider: InMemoryCacheProvider;
  let createVehicleUseCase: CreateVehicleUseCase;
  let updateVehicleUseCase: UpdateVehicleUseCase;
  let deleteVehicleUseCase: DeleteVehicleUseCase;
  let findVehicleUseCase: FindVehicleUseCase;
  let listVehiclesUseCase: ListVehiclesUseCase;
  let model: Model;

  beforeEach(async () => {
    store = new FleetStoreService();
    repository = new InMemoryVehicleRepository(store);
    modelRepository = new InMemoryModelRepository(store);
    cacheProvider = new InMemoryCacheProvider();

    createVehicleUseCase = new CreateVehicleUseCase(
      repository,
      modelRepository,
      cacheProvider,
    );
    updateVehicleUseCase = new UpdateVehicleUseCase(
      repository,
      modelRepository,
      cacheProvider,
    );
    deleteVehicleUseCase = new DeleteVehicleUseCase(repository, cacheProvider);
    findVehicleUseCase = new FindVehicleUseCase(repository, cacheProvider);
    listVehiclesUseCase = new ListVehiclesUseCase(repository, cacheProvider);

    model = await modelRepository.create(
      new Model(
        'model-1',
        'Corolla',
        'brand-1',
        'user-1',
        new Date(),
        new Date(),
      ),
    );
  });

  describe('CreateVehicleUseCase', () => {
    it('should create a vehicle successfully', async () => {
      const result = await createVehicleUseCase.execute({
        licensePlate: 'ABC-1234',
        chassis: '9BWAAAAAA0A000001',
        renavam: '11111111111',
        year: 2022,
        modelId: model.id,
        userId: 'user-1',
      });
      expect(result.id).toBeDefined();
      expect(result.licensePlate).toBe('ABC-1234');
      expect(store.vehicles.length).toBe(1);
    });

    it('should throw ModelNotFoundError if model does not exist', async () => {
      await expect(
        createVehicleUseCase.execute({
          licensePlate: 'ABC-1234',
          chassis: '9BWAAAAAA0A000001',
          renavam: '11111111111',
          year: 2022,
          modelId: 'non-existent',
          userId: 'user-1',
        }),
      ).rejects.toThrow(ModelNotFoundError);
    });

    it('should throw VehicleAlreadyExistsError if licensePlate already exists', async () => {
      await createVehicleUseCase.execute({
        licensePlate: 'ABC-1234',
        chassis: '9BWAAAAAA0A000001',
        renavam: '11111111111',
        year: 2022,
        modelId: model.id,
        userId: 'user-1',
      });
      await expect(
        createVehicleUseCase.execute({
          licensePlate: 'ABC-1234',
          chassis: '9BWAAAAAA0A000002',
          renavam: '22222222222',
          year: 2022,
          modelId: model.id,
          userId: 'user-1',
        }),
      ).rejects.toThrow(VehicleAlreadyExistsError);
    });
  });

  describe('UpdateVehicleUseCase', () => {
    it('should update vehicle successfully', async () => {
      const vehicle = await createVehicleUseCase.execute({
        licensePlate: 'ABC-1234',
        chassis: '9BWAAAAAA0A000001',
        renavam: '11111111111',
        year: 2022,
        modelId: model.id,
        userId: 'user-1',
      });
      const updated = await updateVehicleUseCase.execute({
        id: vehicle.id,
        licensePlate: 'XYZ-9999',
        userId: 'user-1',
      });
      expect(updated.licensePlate).toBe('XYZ-9999');
    });

    it('should throw VehicleNotFoundError', async () => {
      await expect(
        updateVehicleUseCase.execute({
          id: 'non-existent',
          licensePlate: 'XYZ-9999',
          userId: 'user-1',
        }),
      ).rejects.toThrow(VehicleNotFoundError);
    });
  });

  describe('FindVehicleUseCase', () => {
    it('should retrieve a vehicle from database and cache it', async () => {
      const vehicle = await createVehicleUseCase.execute({
        licensePlate: 'ABC-1234',
        chassis: '9BWAAAAAA0A000001',
        renavam: '11111111111',
        year: 2022,
        modelId: model.id,
        userId: 'user-1',
      });
      const found = await findVehicleUseCase.execute(vehicle.id);
      expect(found.id).toBe(vehicle.id);

      const cached = await cacheProvider.get(`vehicles:${vehicle.id}`);
      expect(cached).toBeDefined();
    });

    it('should return cached vehicle if present', async () => {
      const vehicle = await createVehicleUseCase.execute({
        licensePlate: 'ABC-1234',
        chassis: '9BWAAAAAA0A000001',
        renavam: '11111111111',
        year: 2022,
        modelId: model.id,
        userId: 'user-1',
      });
      await cacheProvider.set(
        `vehicles:${vehicle.id}`,
        { ...vehicle, licensePlate: 'CACHED' },
        60,
      );
      const found = await findVehicleUseCase.execute(vehicle.id);
      expect(found.licensePlate).toBe('CACHED');
    });
  });

  describe('ListVehiclesUseCase', () => {
    it('should list and cache vehicles', async () => {
      await createVehicleUseCase.execute({
        licensePlate: 'ABC-1234',
        chassis: '9BWAAAAAA0A000001',
        renavam: '11111111111',
        year: 2022,
        modelId: model.id,
        userId: 'user-1',
      });
      const list = await listVehiclesUseCase.execute();
      expect(list.length).toBe(1);

      const cached = await cacheProvider.get('vehicles:list');
      expect(cached).toBeDefined();
    });
  });

  describe('DeleteVehicleUseCase', () => {
    it('should delete vehicle and clear cache', async () => {
      const vehicle = await createVehicleUseCase.execute({
        licensePlate: 'ABC-1234',
        chassis: '9BWAAAAAA0A000001',
        renavam: '11111111111',
        year: 2022,
        modelId: model.id,
        userId: 'user-1',
      });
      await deleteVehicleUseCase.execute({ id: vehicle.id, userId: 'user-1' });
      expect(store.vehicles.length).toBe(0);
    });
  });
});
