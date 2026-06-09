import { FleetStoreService } from '../../../../shared/infrastructure/fleet-store.service';
import { InMemoryModelRepository } from '../../infrastructure/repositories/in-memory-model.repository';
import { InMemoryBrandRepository } from '../../../brands/infrastructure/repositories/in-memory-brand.repository';
import { CreateModelUseCase } from './create-model.use-case';
import { UpdateModelUseCase } from './update-model.use-case';
import { DeleteModelUseCase } from './delete-model.use-case';
import { FindModelUseCase } from './find-model.use-case';
import { ListModelsUseCase } from './list-models.use-case';
import { ModelAlreadyExistsError } from '../../domain/errors/model-already-exists.error';
import { ModelNotFoundError } from '../../domain/errors/model-not-found.error';
import { ModelHasVehiclesError } from '../../domain/errors/model-has-vehicles.error';
import { BrandNotFoundError } from '../../../brands/domain/errors/brand-not-found.error';
import { Brand } from '../../../brands/domain/entities/brand.entity';

describe('Models Use Cases', () => {
  let store: FleetStoreService;
  let repository: InMemoryModelRepository;
  let brandRepository: InMemoryBrandRepository;
  let createModelUseCase: CreateModelUseCase;
  let updateModelUseCase: UpdateModelUseCase;
  let deleteModelUseCase: DeleteModelUseCase;
  let findModelUseCase: FindModelUseCase;
  let listModelsUseCase: ListModelsUseCase;
  let brand: Brand;

  beforeEach(async () => {
    store = new FleetStoreService();
    repository = new InMemoryModelRepository(store);
    brandRepository = new InMemoryBrandRepository(store);
    createModelUseCase = new CreateModelUseCase(repository, brandRepository);
    updateModelUseCase = new UpdateModelUseCase(repository, brandRepository);
    deleteModelUseCase = new DeleteModelUseCase(repository);
    findModelUseCase = new FindModelUseCase(repository);
    listModelsUseCase = new ListModelsUseCase(repository);

    brand = await brandRepository.create(
      new Brand('brand-1', 'Toyota', 'user-1', new Date(), new Date()),
    );
  });

  describe('CreateModelUseCase', () => {
    it('should create a model successfully', async () => {
      const result = await createModelUseCase.execute({
        name: 'Corolla',
        brandId: brand.id,
        userId: 'user-1',
      });
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Corolla');
      expect(result.brandId).toBe(brand.id);
    });

    it('should throw BrandNotFoundError if brand does not exist', async () => {
      await expect(
        createModelUseCase.execute({
          name: 'Corolla',
          brandId: 'non-existent',
          userId: 'user-1',
        }),
      ).rejects.toThrow(BrandNotFoundError);
    });

    it('should throw ModelAlreadyExistsError on duplicate name within the same brand', async () => {
      await createModelUseCase.execute({
        name: 'Corolla',
        brandId: brand.id,
        userId: 'user-1',
      });
      await expect(
        createModelUseCase.execute({
          name: 'Corolla',
          brandId: brand.id,
          userId: 'user-1',
        }),
      ).rejects.toThrow(ModelAlreadyExistsError);
    });
  });

  describe('UpdateModelUseCase', () => {
    it('should update model details successfully', async () => {
      const model = await createModelUseCase.execute({
        name: 'Corolla',
        brandId: brand.id,
        userId: 'user-1',
      });
      const updated = await updateModelUseCase.execute({
        id: model.id,
        name: 'Corolla Updated',
        userId: 'user-1',
      });
      expect(updated.name).toBe('Corolla Updated');
    });

    it('should throw ModelNotFoundError', async () => {
      await expect(
        updateModelUseCase.execute({
          id: 'non-existent',
          name: 'Corolla',
          userId: 'user-1',
        }),
      ).rejects.toThrow(ModelNotFoundError);
    });

    it('should throw BrandNotFoundError if new brand does not exist', async () => {
      const model = await createModelUseCase.execute({
        name: 'Corolla',
        brandId: brand.id,
        userId: 'user-1',
      });
      await expect(
        updateModelUseCase.execute({
          id: model.id,
          brandId: 'non-existent',
          userId: 'user-1',
        }),
      ).rejects.toThrow(BrandNotFoundError);
    });

    it('should throw ModelAlreadyExistsError on duplicate name', async () => {
      const model1 = await createModelUseCase.execute({
        name: 'Corolla',
        brandId: brand.id,
        userId: 'user-1',
      });
      await createModelUseCase.execute({
        name: 'Camry',
        brandId: brand.id,
        userId: 'user-1',
      });
      await expect(
        updateModelUseCase.execute({
          id: model1.id,
          name: 'Camry',
          userId: 'user-1',
        }),
      ).rejects.toThrow(ModelAlreadyExistsError);
    });
  });

  describe('FindModelUseCase', () => {
    it('should find model by id', async () => {
      const model = await createModelUseCase.execute({
        name: 'Corolla',
        brandId: brand.id,
        userId: 'user-1',
      });
      const found = await findModelUseCase.execute(model.id);
      expect(found.id).toBe(model.id);
    });

    it('should throw ModelNotFoundError', async () => {
      await expect(findModelUseCase.execute('non-existent')).rejects.toThrow(
        ModelNotFoundError,
      );
    });
  });

  describe('ListModelsUseCase', () => {
    it('should list all models', async () => {
      await createModelUseCase.execute({
        name: 'Corolla',
        brandId: brand.id,
        userId: 'user-1',
      });
      const list = await listModelsUseCase.execute();
      expect(list.length).toBe(1);
    });
  });

  describe('DeleteModelUseCase', () => {
    it('should delete model successfully', async () => {
      const model = await createModelUseCase.execute({
        name: 'Corolla',
        brandId: brand.id,
        userId: 'user-1',
      });
      await deleteModelUseCase.execute({ id: model.id, userId: 'user-1' });
      expect(store.models.length).toBe(0);
    });

    it('should throw ModelNotFoundError', async () => {
      await expect(
        deleteModelUseCase.execute({ id: 'non-existent', userId: 'user-1' }),
      ).rejects.toThrow(ModelNotFoundError);
    });

    it('should throw ModelHasVehiclesError if model has vehicles', async () => {
      const model = await createModelUseCase.execute({
        name: 'Corolla',
        brandId: brand.id,
        userId: 'user-1',
      });
      store.vehicles.push({
        id: 'vehicle-1',
        licensePlate: 'ABC-1234',
        chassis: 'chassis-1',
        renavam: 'renavam-1',
        year: 2020,
        modelId: model.id,
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await expect(
        deleteModelUseCase.execute({ id: model.id, userId: 'user-1' }),
      ).rejects.toThrow(ModelHasVehiclesError);
    });
  });
});
